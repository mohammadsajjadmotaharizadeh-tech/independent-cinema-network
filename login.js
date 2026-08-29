import {signToken} from "./_auth.js";
export default function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"method"});
 const {username,password}=req.body||{};
 const users={
   [process.env.SUDDEN_USERNAME||"sudden.director"]:{pass:process.env.SUDDEN_PASSWORD||"",film:"sudden"},
   [process.env.BATTLE_USERNAME||"battle.director"]:{pass:process.env.BATTLE_PASSWORD||"",film:"battle"}
  };
 const u=users[username];
 if(!u||!u.pass||password!==u.pass)return res.status(401).json({error:"invalid"});
 try{
  const token=signToken({film:u.film,username});
  return res.status(200).json({token,film:u.film});
 }catch(e){
  console.error("signToken error:",e);
  return res.status(500).json({error:"auth_error"});
 }
}