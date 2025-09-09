/* ---------- controllers/saveResumeController.js ---------- */
import Resume from "../models/resumeSchema.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";


/* ───────────────── CREATE ───────────────── */
export const saveResumeController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { personalInfo, skills, experience, projects, education, achievements, extracurricular } = req.body;

    const newResume = new Resume({
      userId,
      personalInfo,
      skills,
      experience,
      projects,
      education,
      achievements,
      extracurricular,
    });
    await newResume.save();
    res.status(201).json({
      message: "Resume saved successfully!",
      resumeId: newResume._id,
      _id: newResume._id              // optional, for backward compatibility
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ───────────────── READ (all) ───────────────── */
export const getAllUserResumesController = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    if (!resumes) return res.status(404).json({ message: "Resume not found" });
    res.status(200).json({ resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ───────────────── READ (single) ───────────────── */
export const getSavedResumesController = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.status(200).json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ───────────────── UPDATE ───────────────── */
export const updateResumeController = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resumeId))
      return res.status(400).json({ message: "Invalid resume ID" });

    const { personalInfo, skills, experience, projects, education, achievements, extracurricular } = req.body;

    const clean = arr => (arr || []).map(({ _id, ...rest }) => rest);

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId: req.user.id },
      {
        personalInfo,
        skills,
        experience: clean(experience),
        projects: clean(projects),
        education: clean(education),
        achievements,
        extracurricular,
      },
      { new: true }
    );

    if (!resume) return res.status(404).json({ message: "Resume not found or you don’t have access" });
    res.status(200).json({ message: "Resume updated successfully", resume });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/* ───────────────── DELETE ───────────────── */
export const deleteResumeController = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resumeId))
      return res.status(400).json({ message: "Invalid resume ID" });

    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found or you don’t have access" });

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/* ───────────────── DOWNLOAD AS PDF ───────────────── */
export const downloadResumeController = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    /* ---- launch Puppeteer ---- */
    const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage'
  ]
});


    const page = await browser.newPage();

    /* ---- load template ---- */
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.join(
      __dirname,
      "../templates/resume-template.html"
    );
    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    /* ---------- helpers ---------- */
    const spanTags = (arr) =>
      (arr || [])
        .map((s) => `<span class="skill">${s}</span>`)
        .join("");

    const bulletList = (arr) =>
      (arr || []).map((i) => `<li>${i}</li>`).join("");

    const blockList = (arr, fn) => (arr || []).map(fn).join("");

    /* ---------- dynamic blocks ---------- */
    const educationHTML = blockList(resume.education, (edu) => `
      <div class="item">
        <h3 class="bold">${edu.school || ""}</h3>
        <p class="sub">${edu.degree || ""} • ${edu.year || ""}</p>
      </div>`);

    const experienceHTML = blockList(resume.experience, (exp) => `
      <div class="item">
        <h3 class="bold">${exp.title || ""} @ ${exp.company || ""}</h3>
        <p class="sub">${exp.startDate || ""} – ${exp.endDate || "Present"}</p>
        <ul>${bulletList(exp.description ? [exp.description] : [])}</ul>
      </div>`);

    const projectsHTML = blockList(resume.projects, (proj) => `
      <div class="item">
        <h3 class="bold">${proj.title || ""}</h3>
        <p class="sub">${proj.description || ""}</p>
        ${proj.link
        ? `<a href="${proj.link}" target="_blank">${proj.link}</a>`
        : ""
      }
      </div>`);

    /* ---------- section wrappers ---------- */
    const section = (title, inner) =>
      inner.trim()
        ? `<div class="section"><h2>${title}</h2>${inner}</div>`
        : "";

    /* ---------- assembled sections ---------- */
    const educationSection = section("Education", educationHTML);
    const skillsSection = section("Skills", spanTags(resume.skills));
    const experienceSection = section("Experience", experienceHTML);
    const projectsSection = section("Projects", projectsHTML);
    const achievementsSection = section(
      "Achievements",
      `<ul>${bulletList(resume.achievements)}</ul>`
    );
    const extracurricularSection = section(
      "Extra-Curricular Activities",
      `<ul>${bulletList(resume.extracurricular)}</ul>`
    );

    /* ---------- placeholder injection ---------- */
    htmlContent = htmlContent
      .replace(/{{\s*name\s*}}/g, resume.personalInfo?.name || "N/A")
      .replace(/{{\s*email\s*}}/g, resume.personalInfo?.email || "")
      .replace(/{{\s*phone\s*}}/g, resume.personalInfo?.phone || "")
      .replace(/{{\s*github\s*}}/g, resume.personalInfo?.github || "")
      .replace(/{{\s*linkedin\s*}}/g, resume.personalInfo?.linkedin || "")
      // whole-section placeholders
      .replace("{{educationSection}}", educationSection)
      .replace("{{skillsSection}}", skillsSection)
      .replace("{{experienceSection}}", experienceSection)
      .replace("{{projectsSection}}", projectsSection)
      .replace("{{achievementsSection}}", achievementsSection)
      .replace("{{extracurricularSection}}", extracurricularSection);

    /* ---- generate PDF ---- */
    await page.setContent(htmlContent, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="${(resume.personalInfo?.name || "Resume").replace(/\s+/g, "_")
        }.pdf"`,
    });
    res.end(pdfBuffer, "binary");
  } catch (err) {
    console.error("Error generating resume:", err);
    res.status(500).json({ error: "Failed to generate resume PDF" });
  }
};

