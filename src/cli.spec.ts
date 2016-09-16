jest.mock('./index');

import { testAsync } from './testUtils';
import { npmLinkSubFolder } from './index';
import { default as cli } from './cli';

export type ProcessType = typeof process;
export type ConsoleType = typeof console;

describe('npmLinkSubFolder', () => {

  let npmLinkSubFolderMock = npmLinkSubFolder as jest.Mock<typeof npmLinkSubFolder>;
  let process = {} as ProcessType;
  let console = {} as ConsoleType;

  beforeEach(() => {
    process.argv = ['node', 'npm-link-subfolder', 'package', 'folder'];
    process.exit = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
    npmLinkSubFolderMock.mockReturnValue(Promise.resolve({
      from: 'from',
      to: 'to'
    }));
  });

  it('should exit when no params', testAsync(async function() {
    process.argv = ['node', 'npm-link-subfolder'];
    await Promise.resolve(cli(process, console));
    expect(console.log).toBeCalled();
    expect(process.exit).toBeCalledWith(1);
  }));

  it('should exit when too much params', testAsync(async function() {
    process.argv = ['node', 'npm-link-subfolder', 'package', 'folder', 'extra'];
    await Promise.resolve(cli(process, console));
    expect(console.log).toBeCalled();
    expect(process.exit).toBeCalledWith(1);
  }));

  it('should pass parameters to npmLinkSubFolder', testAsync(async function() {
    await Promise.resolve(cli(process, console));
    expect(npmLinkSubFolderMock).toBeCalledWith('package', 'folder');
  }));

  it('should log when no error', testAsync(async function() {
    await Promise.resolve(cli(process, console));
    expect(console.log).toBeCalledWith('from -> to');
  }));

  it('should exit when npmLinkSubFolder failed', testAsync(async function() {
    npmLinkSubFolderMock.mockReturnValue(Promise.reject('error'));
    await Promise.resolve(cli(process, console));
    expect(console.error).toBeCalled();
    expect(process.exit).toBeCalledWith(1);
  }));

});
