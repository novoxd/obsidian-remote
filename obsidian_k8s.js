var sleep = require('system-sleep');

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const HELM_EXCLUDABLE = 'microk8s helm';
const KUBECTL_EXCLUDABLE = 'microk8s kubectl';

//const HELM_EXCLUDABLE = 'helm';
//const KUBECTL_EXCLUDABLE = 'kubectl';
const POD_WAIT_READY_SECONDS = 30

function exec_host(execStr) {
  exec(execStr,
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    }
  );
}


function newObsidianInstance(instanceName, vncPort=8080, devPort=8081) {
    const helExec = HELM_EXCLUDABLE + ` install --set service.obsidian.port=${vncPort} --set service.dev_proxy.port=${devPort} ${instanceName} ./obsidian_helm_remote`
    console.log(helExec)
    const helmInstallResult = execSync(helExec, {stdio: 'inherit'})

    const podStatusExec = KUBECTL_EXCLUDABLE + ` get pods --selector=app.kubernetes.io/name=obsidian --selector=app.kubernetes.io/instance=${instanceName} --output="jsonpath={.items[*].status}"`


    for (var i = 1; i <= POD_WAIT_READY_SECONDS; i++) {
        const podStatusResult = JSON.parse(execSync(podStatusExec).toString().trim());
       if (podStatusResult['phase'] === 'Pending') continue

        console.log(podStatusResult);
        if (
            Object.keys(podStatusResult['containerStatuses'][0]['state'])[0] === 'running' &
            Object.keys(podStatusResult['containerStatuses'][1]['state'])[0] === 'running'
            ) {
            break
        }
        console.log('waiting ' + i + 'sec for pod ready');
        sleep(1*1000)
    }

    const podIpExec = KUBECTL_EXCLUDABLE + ` get services --selector=app.kubernetes.io/name=obsidian --selector=app.kubernetes.io/instance=${instanceName} --output=jsonpath='{.items[*].spec.clusterIP}'`
    const podIpResult = execSync(podIpExec).toString().trim();

    return {
        'ip': podIpResult,
        'vncPort': vncPort,
        'devPort': devPort,
    }
}

function deleteObsidianInstance(instanceName) {
    const helExec = HELM_EXCLUDABLE + ` delete ${instanceName}`
    console.log(helExec)
    const helmInstallResult = execSync(helExec, {stdio: 'inherit'})
}

console.log(newObsidianInstance('obsidian1'))
