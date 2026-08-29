import {verifyToken} from "./_auth.js";
import {getFilm} from "./data-layer.js";
export default function handler(req,res){
 const token=(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 const s=verifyToken(token); if(!s)return res.status(401).json({error:"unauthorized"});
 const film=getFilm(s.film);
 if(!film)return res.status(404).json({error:"film_not_found"});
 return res.status(200).json(film);
}