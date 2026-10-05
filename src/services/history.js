function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchAppointmentData() {
  try {
    const res = await fetch(`../payloadDummy/history.json`, { headers: authHeaders() });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    console.log("data history", data);
    return Array.isArray(data) ? data : [data];
    // return data;
  } catch (e) {
    console.log("error woi", e);
    return null;
  }
}

export async function fetchDetailData(id) {
  try {
    const response = await fetch(`../payloadDummy/qrData.json?id=${id}`, { headers: authHeaders() });

    if (!response.ok) return;

    const data = await response.json();
    console.log("detail", data);
    return data;
  } catch (e) {
    console.log("error bro", e);
    return null;
  }
}
