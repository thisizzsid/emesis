
function testChatLogic() {
  const user = { uid: "user_a" };
  
  // Simulate the logic found in app/chat/[id]/page.tsx
  const getPartnerUid = (id: string, currentUserUid: string) => {
    if (id.startsWith(currentUserUid + "_")) {
      return id.substring(currentUserUid.length + 1);
    } else if (id.endsWith("_" + currentUserUid)) {
      return id.substring(0, id.length - currentUserUid.length - 1);
    }
    return null;
  };

  const cases = [
    { id: "user_a_user_b", expected: "user_b" },
    { id: "user_b_user_a", expected: "user_b" },
    { id: "user_a_ai_user", expected: "ai_user" },
    { id: "ai_user_user_a", expected: "ai_user" },
    { id: "user_a_complex_user_name", expected: "complex_user_name" },
    { id: "complex_user_name_user_a", expected: "complex_user_name" }
  ];

  console.log("Running Chat Logic Verification...");

  let passed = 0;
  cases.forEach(({ id, expected }) => {
    const result = getPartnerUid(id, user.uid);
    const isPass = result === expected;
    if (isPass) passed++;
    console.log(`[${isPass ? "PASS" : "FAIL"}] ID: ${id} -> Expected: ${expected}, Got: ${result}`);
  });

  console.log(`\nTotal: ${cases.length}, Passed: ${passed}, Failed: ${cases.length - passed}`);
}

testChatLogic();
