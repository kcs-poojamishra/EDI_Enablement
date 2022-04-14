import { initialize, s3FileSyncServices } from "./src/services/s3FileSyncServices"
import express from 'express';
const app = express();
const port = 3000;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

function index() {
  s3FileSyncServices();
}

initialize();
index();

