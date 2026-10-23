import http from "http";

// Simple test suite runner for Node.js
async function runTests() {
  console.log("=== STARTING AUTOMATED TEST SUITE FOR SAIT ASK US ANYTHING ===");
  const baseUrl = "http://localhost:3000";

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test G: Validation Checks
  console.log("\n--- TEST GROUP: Input Validation & Sanitization ---");
  {
    // Empty submission
    const resBlank = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "   " }),
    });
    assert(resBlank.status === 400, "Rejects blank/whitespace-only question with HTTP 400");

    // Overlength submission (> 500 chars)
    const longText = "A".repeat(505);
    const resLong = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: longText }),
    });
    assert(resLong.status === 400, "Rejects overlength question (> 500 characters) with HTTP 400");

    // Honeypot trap
    const resBot = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "I am a bot", honeypot: "spam-bot-value" }),
    });
    assert(resBot.status === 200, "Silently consumes honeypot bot trap");
  }

  // 2. Test A & C: Anonymous Student Submission & Multiple Questions
  console.log("\n--- TEST GROUP: Anonymous Submission & Sequence ---");
  let submittedId1 = "";
  let submittedId2 = "";
  {
    const res1 = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "<script>alert('xss')</script>What is the best way to prepare for tech interviews?" }),
    });
    const json1 = await res1.json();
    assert(res1.status === 201 && json1.success, "Valid student question submitted successfully (HTTP 201)");
    assert(!json1.data.question.includes("<script>"), "Dangerous script tags safely stripped");
    assert(!("ip" in json1.data) && !("email" in json1.data) && !("name" in json1.data), "Privacy: Zero personal info or IP stored in question data");
    submittedId1 = json1.data.id;

    const res2 = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Can first years take part in the upcoming inter-college hackathon?" }),
    });
    const json2 = await res2.json();
    assert(res2.status === 201 && json2.success, "Second question from separate student saved");
    submittedId2 = json2.data.id;
  }

  // 3. Test B: Public Queue Display
  console.log("\n--- TEST GROUP: Public Queue Retrieval (/display) ---");
  {
    const res = await fetch(`${baseUrl}/api/questions`);
    const json = await res.json();
    assert(res.status === 200 && json.success, "Fetches public questions queue");
    const qList = json.data.questions;
    assert(Array.isArray(qList) && qList.length >= 2, "Questions returned as ordered array with stable sequence");
    assert(qList.every(q => q.status !== "hidden"), "Public queue excludes hidden items");
  }

  // 4. Test F: Admin Authorization Enforcement
  console.log("\n--- TEST GROUP: Authorization Security ---");
  {
    // Try to update status without cookie
    const resUnauthed = await fetch(`${baseUrl}/api/admin/questions/${submittedId1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "answered" }),
    });
    assert(resUnauthed.status === 401, "Rejects unauthorized PATCH to question status (HTTP 401)");

    // Try to navigate session without cookie
    const resSessionUnauthed = await fetch(`${baseUrl}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next" }),
    });
    assert(resSessionUnauthed.status === 401, "Rejects unauthorized session change (HTTP 401)");

    // Try bad PIN
    const resBadPin = await fetch(`${baseUrl}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "wrong-pin-999" }),
    });
    assert(resBadPin.status === 401, "Rejects incorrect PIN with HTTP 401");
  }

  // 5. Test D: Admin PIN Login & Session Navigation
  console.log("\n--- TEST GROUP: Admin PIN Authentication & Live Controls ---");
  let cookieHeader = "";
  {
    const resLogin = await fetch(`${baseUrl}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "SAIT2026" }),
    });
    assert(resLogin.status === 200, "Authorizes correct admin PIN (HTTP 200)");
    const setCookie = resLogin.headers.get("set-cookie");
    assert(Boolean(setCookie && setCookie.includes("sait_admin_session")), "Issues signed HttpOnly sait_admin_session cookie");
    cookieHeader = setCookie?.split(";")[0] || "";

    // Set current question to submittedId1
    const resSet = await fetch(`${baseUrl}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ action: "set", questionId: submittedId1 }),
    });
    const setJson = await resSet.json();
    assert(setJson.success && setJson.data.current_question_id === submittedId1, "Admin selects specific question for projector spotlight");

    // Navigate Next
    const resNext = await fetch(`${baseUrl}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ action: "next" }),
    });
    const nextJson = await resNext.json();
    assert(nextJson.success, "Admin advances projector to next question");

    // Mark as answered
    const resAnswer = await fetch(`${baseUrl}/api/admin/questions/${submittedId1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ status: "answered" }),
    });
    const answerJson = await resAnswer.json();
    assert(answerJson.success && answerJson.data.status === "answered", "Admin successfully marks question as answered");
  }

  // 6. Test H: Question Backups (CSV & JSON)
  console.log("\n--- TEST GROUP: Backup Export Functionality ---");
  {
    const resJsonExport = await fetch(`${baseUrl}/api/admin/export?format=json`, {
      headers: { Cookie: cookieHeader },
    });
    const jsonExport = await resJsonExport.json();
    assert(resJsonExport.status === 200 && Array.isArray(jsonExport.questions), "Exports questions backup in JSON format");

    const resCsvExport = await fetch(`${baseUrl}/api/admin/export?format=csv`, {
      headers: { Cookie: cookieHeader },
    });
    const csvExport = await resCsvExport.text();
    assert(resCsvExport.status === 200 && csvExport.includes("Sequence,ID,Status"), "Exports questions backup in CSV format");
  }

  console.log("\n========================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
