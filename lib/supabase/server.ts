import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function createClient(){const jar=await cookies();const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return null;return createServerClient(url,key,{cookies:{getAll(){return jar.getAll()},setAll(cookiesToSet:{name:string;value:string;options:CookieOptions}[]){try{cookiesToSet.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}})}
