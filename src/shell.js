const exec = require('child_process').exec;
const promiseToChildProcessMap = new WeakMap();

const kill = (promise) => {

    if (promiseToChildProcessMap.has(promise)) {

        const childProcess = promiseToChildProcessMap.get(promise);
        promiseToChildProcessMap.delete(promise);
        childProcess.kill();

    }

};

const execute = (commandToExecute, options = {}) => {

    let childProcess;

    const promise = new Promise((resolve, reject) => {

        childProcess = exec(commandToExecute, Object.assign({}, {

            cwd: null, //working directory of the child process
            env: null, //Environment key-value pairs.
            encoding: 'utf8',
            shell: '/bin/sh',
            timeout: 0,
            maxBuffer: 1024 * 1024, //Largest amount of data in bytes allowed on stdout or stderr. If exceeded, the child process is terminated and any output is truncated.
            killSignal: 'SIGTERM',
            // uid <number> Sets the user identity of the process (see setuid(2)).
            // gid <number> Sets the group identity of the process (see setgid(2)).
            windowsHide: false //Hide the subprocess console window that would normally be created on Windows systems

        }, options), (error, stdout, stderr) => {

            promiseToChildProcessMap.delete(promise);

            if (error) {

                reject(error);

            } else {

                resolve({
                    stdout,
                    stderr
                });

            }

        });

    });

    promiseToChildProcessMap.set(promise, childProcess);

    return promise;

};

module.exports = {
    exec: execute,
    kill
};
