import * as path from 'path';
import * as bluebird from 'bluebird';
import * as rimrafNode from 'rimraf';
import { exec as execNode } from 'child_process';
import { lstat as lstatNode, symlink as symlinkNode } from 'fs';

const rimraf = bluebird.promisify(rimrafNode);
const exec = bluebird.promisify<string, string>(execNode);
const lstat = bluebird.promisify(lstatNode);
const symlink = bluebird.promisify(symlinkNode);

export interface Result {
  from: string;
  to: string;
}

export async function npmLinkSubFolder(packageName: string, subFolder: string): Promise<Result> {
  const localRoot = (await exec('npm root')).trim();
  const globalRoot = (await exec('npm root -g')).trim();

  if (await isDirectory(localRoot) === false) {
    throw new Error(`'npm root' folder is not a directory: ${localRoot}`);
  }

  if (await isDirectory(globalRoot) === false) {
    throw new Error(`'npm root -g' folder is not a directory: ${globalRoot}`);
  }

  const localPackage = path.join(localRoot, packageName);
  if (await isSymbolicLink(localPackage) === true || await isDirectory(localPackage) === false) {
    throw new Error(`Package '${packageName}' has to be installed first the normal way in ${localPackage}.`);
  }

  const globalPackage = path.join(globalRoot, packageName);
  if (await isDirectory(globalPackage) === false && await isSymbolicLink(globalPackage) === false) {
    throw new Error(`Package '${packageName}' has to be linked or installed globally in ${globalPackage}.`);
  }

  const to = path.join(globalPackage, subFolder);
  if (await isDirectory(to) === false) {
    throw new Error(`Subfolder '${subFolder}' in global package '${packageName}' does not exist at ${to}.`);
  }

  const from = path.join(localPackage, subFolder);
  if (await isSymbolicLink(from) === true) {
    throw new Error(`Subfolder '${subFolder}' in package '${packageName}' is already linked.`);
  }

  await rimraf(from);
  await symlink(to, from, 'junction');

  return { from, to };
};

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await lstat(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

async function isSymbolicLink(path: string) {
  try {
    const stat = await lstat(path);
    return stat.isSymbolicLink();
  } catch (e) {
    return false;
  }
}
