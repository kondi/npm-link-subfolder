export declare function fail(e: any): void; // missing in @types/jest

export function testAsync(runAsync: any): any {
  return (done: any) => {
    runAsync().then(() => done(), (error: any) => {
      fail(error);
      done();
    });
  };
}
