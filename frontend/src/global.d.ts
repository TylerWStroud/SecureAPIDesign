/// <reference types="vite/client" />

// --- Allow importing React, CSS, and assets ---
declare module "react";
declare module "*.css";
declare module "*.scss";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
declare module "*.mp4";
declare module "*.webp";

// --- Vite env variable types ---
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
