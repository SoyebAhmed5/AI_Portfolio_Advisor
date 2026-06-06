require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");

const app = express();
