function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchDataCheckin() {
  try {
    const ress = await fetch(`../payloadDummy/checkinData.json`, { headers: authHeaders() });
    if (!ress) return;

    const data = await ress.json();
    console.log("ni", data);
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
