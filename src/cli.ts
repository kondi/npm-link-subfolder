import { npmLinkSubFolder } from './index';

export type ProcessType = typeof process;
export type ConsoleType = typeof console;

export default function(process: ProcessType, cns: ConsoleType) {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    cns.log('Usage: npm-link-subfolder <pkg> <folder>');
    process.exit(1);
    return;
  }

  const [packageName, subFolder] = args;

  return npmLinkSubFolder(packageName, subFolder)
    .then(({ from, to }) => {
      cns.log(`${from} -> ${to}`);
    })
    .catch(error => {
      cns.error(error);
      process.exit(1);
    });
};
