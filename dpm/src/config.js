export const conf = {
    "WS_URL": process.env.REACT_APP_ENV === "DEV" ? "ws://localhost:5000" : "wss://herkdpm.herokuapp.com"
}