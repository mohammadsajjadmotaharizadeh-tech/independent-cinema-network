import crypto from "crypto";
const IS_PRODUCTION=process.env.NODE_ENV==="production";
const SECRET=process.env.SESSION_SECRET||(IS_PRODUCTION?error("SESSION_SECRET required in production"):"dev-fallback-secret-change-me");
const enc=x=>Buffer.from(x).toString("base64url");
export function signToken(payload){
 if(!SECRET) throw new Error("SESSION_SECRET missing");
 const body=enc(JSON.stringify({...payload,exp:Date.now()+12*60*60*1000}));
 const sig=crypto.createHmac("sha256",SECRET).update(body).digest("base64url");
 return `${body}.${sig}`;
}
export function verifyToken(token){
 try{
  if(!SECRET||!token)return null;
  const [body,sig]=token.split("."); if(!body||!sig)return null;
  const ex=crypto.createHmac("sha256",SECRET).update(body).digest("base64url");
  if(sig.length!==ex.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(ex)))return null;
  const d=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
  if(d.exp<Date.now())return null; return d;
 }catch{return null}
}
export function isProduction(){return IS_PRODUCTION;}