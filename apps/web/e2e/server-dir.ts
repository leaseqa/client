import { existsSync } from "node:fs";
import path from "node:path";

const FALLBACK_RELATIVE = "../../../leaseqa-server";
const CANDIDATE_RELATIVES = [
  FALLBACK_RELATIVE,
  "../../../server-engineering",
  "../../../server",
  "../../../../server",
];

export const resolveLeaseqaServerDir = (
  fromDir: string,
  env: Record<string, string | undefined> = process.env,
  exists: (filePath: string) => boolean = existsSync,
) => {
  if ( env.LEASEQA_SERVER_DIR ) {
    return path.resolve(env.LEASEQA_SERVER_DIR);
  }

  for ( const relative of CANDIDATE_RELATIVES ) {
    const candidate = path.resolve(fromDir, relative);
    if ( exists(candidate) ) {
      return candidate;
    }
  }

  return path.resolve(fromDir, FALLBACK_RELATIVE);
};
