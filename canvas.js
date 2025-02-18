async function getCanvasData(proxy, token) { // for some reason proxy isnt working so wtv
  try {
    const base = `https://mvla.instructure.com/api/v1/courses?enrollment_state=active`;
    const res = await fetch(`${base}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch(err) {
    return new Error;
  }
}

module.exports = {
  getCanvasData
}