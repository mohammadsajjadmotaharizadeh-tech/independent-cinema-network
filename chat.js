import OpenAI from "openai";
import {verifyToken} from "./_auth.js";
import prompts from "../agent-prompts.json" with {type:"json"};
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"method"});
 const token=(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 const s=verifyToken(token); if(!s)return res.status(401).json({error:"unauthorized"});
 if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)return res.status(503).json({error:"backend_not_configured"});
 const {message,history=[]}=req.body||{}; if(!message)return res.status(400).json({error:"message_required"});
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const safe=Array.isArray(history)?history.slice(-12).map(x=>({role:x.role==="assistant"?"assistant":"user",content:String(x.content||"").slice(0,6000)})):[];
 try{
  const r=await client.responses.create({model:process.env.OPENAI_MODEL,instructions:prompts[s.film],input:[...safe,{role:"user",content:String(message).slice(0,10000)}]});
  return res.status(200).json({reply:r.output_text||"پاسخی دریافت نشد."});
 }catch(e){console.error(e);return res.status(500).json({error:"agent_error"})}
}