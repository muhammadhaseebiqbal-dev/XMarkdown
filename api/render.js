import { randomBytes } from 'node:crypto';
import { createParser } from '../src/index.js';
import { frame } from '../website/frame.js';

// The public playground is deliberately smaller than the library's default profile.
// Each request owns its parser/cache. Document source is not logged or persisted here.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Use POST to render a document.'});
  }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({error:'Send application/json.'});
  if (Number(req.headers['content-length'] || 0) > 131072) return res.status(413).json({error:'Request is too large.'});
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (typeof body?.source !== 'string') return res.status(400).json({error:'Source must be a string.'});
    if (body.source.length > 32768) return res.status(413).json({error:'Playground sources are limited to 32,768 code units.'});
    const result = createParser({maxInputCodeUnits:32768,maxOutputCodeUnits:524288,maxTokens:8192,cacheEntries:0}).parse(body.source);
    return res.status(200).json({html:frame(result,randomBytes(18).toString('base64')),diagnostics:result.diagnostics});
  } catch (error) {
    // Avoid returning internal stacks or unexpected dependency error details.
    return res.status(422).json({error:error instanceof RangeError ? error.message : 'This document could not be rendered. Check its syntax and limits.'});
  }
}
