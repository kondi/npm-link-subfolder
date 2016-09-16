jest.mock('child_process');

import * as installFs from 'mock-fs';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import { exec } from 'child_process';

import { testAsync, fail } from './testUtils';
import { npmLinkSubFolder } from './index';

describe('npmLinkSubFolder', () => {

  let localRoot: string;
  let globalRoot: string;
  const sampleFs = {
    'localRoot': {
      'package': {
        'folder': {
          'onlyInLocalFile': ''
        },
        'file': ''
      }
    },
    'globalRoot': {
      'package': {
        'folder': {},
        'file': ''
      }
    }
  };
  let mockFs: typeof sampleFs;

  beforeEach(() => {
    const execMock = exec as jest.Mock<typeof exec>;
    execMock.mockImplementation((cmd: string, cb: any) => {
      if (cmd === 'npm root') {
        cb(null, localRoot);
      }
      if (cmd === 'npm root -g') {
        cb(null, globalRoot);
      }
    });
    localRoot = 'localRoot';
    globalRoot = 'globalRoot';
    mockFs = JSON.parse(JSON.stringify(sampleFs));
  });

  afterEach(() => {
    installFs.restore();
  });

  it('should fail on missing local root', testAsync(async function() {
    delete mockFs.localRoot;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail on missing global root', testAsync(async function() {
    installFs(mockFs);
    rimraf.sync(globalRoot);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail when local package is missing', testAsync(async function() {
    delete mockFs.localRoot.package;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail when local package is linked', testAsync(async function() {
    mockFs.localRoot.package = installFs.symlink({ path: '' }) as any;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail when global package is missing', testAsync(async function() {
    delete mockFs.globalRoot.package;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail when folder in global package is missing', testAsync(async function() {
    delete mockFs.globalRoot.package.folder;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should fail when folder is already linked', testAsync(async function() {
    mockFs.localRoot.package.folder = installFs.symlink({ path: '' }) as any;
    installFs(mockFs);
    try {
      await npmLinkSubFolder('package', 'folder');
      fail('Missing error');
    } catch (e) { }
  }));

  it('should delete existing folder', testAsync(async function() {
    installFs(mockFs);

    let statsBefore = fs.lstatSync('localRoot/package/folder');
    expect(statsBefore.isDirectory()).toBe(true);
    expect(statsBefore.isSymbolicLink()).toBe(false);
    expect(fs.statSync('localRoot/package/folder/onlyInLocalFile')).toBeTruthy();

    await npmLinkSubFolder('package', 'folder');

    expect(() => fs.statSync('localRoot/package/folder/onlyInLocalFile')).toThrow();
    const statsAfter = fs.lstatSync('localRoot/package/folder');
    expect(statsAfter.isDirectory()).toBe(false);
    expect(statsAfter.isSymbolicLink()).toBe(true);
  }));

});
