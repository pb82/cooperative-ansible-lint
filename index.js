const child_process = require("child_process");
const ansibleLintBinary = './venv/bin/ansible-lint';
const { partition, listFiles} = require('./util')

function lintBatch(batch) {
    const files = batch.map(batch => batch.file).join(' ');
    try {
        child_process.execSync(`${ansibleLintBinary} --fix --config-file=./ansible-lint-config.yml ${files} &> /dev/null`);
    } catch (e) {
        return true;
    }
    return false;
}

class Scheduler {
    constructor() {
        this.jobs = [];
    }

    addJob(thread) {
        this.jobs.push(thread);
    }

    removeJob(index) {
        this.jobs.splice(index, 1);
    }

    run() {
        let yields = 0;
        while (this.jobs.length) {
            let currentJob = yields % this.jobs.length;
            let jobState = this.jobs[currentJob].next();
            if (jobState.done) {
                this.removeJob(currentJob);
            }
            yields++;
        }

        console.log("All jobs finished execution");
    }
}

function* job(name, dir) {
    console.log(`start job ${name}`);

    // TODO: git clone repository. This assumes that the repo is already cloned.

    const files = listFiles(dir);
    yield

    const batches = partition(files);
    yield

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const issuesFound = lintBatch(batch);
        if (issuesFound) {
            console.log(`batch ${i + 1}/${batches.length} of job ${name}: linter found issues`);
        } else {
            console.log(`batch ${i + 1}/${batches.length} of job ${name}: linter found no issues`);
        }
        yield
    }

    // TODO: create Pull Request
}

function main() {
    const scheduler = new Scheduler();
    // scheduler.addJob(job('amazon.aws', '/home/peter/Projects/amazon.aws'));
    // scheduler.addJob(job('ansible-role-apache', '/home/peter/Projects/ansible-role-apache'));
    // scheduler.addJob(job('ansible-role-java', '/home/peter/Projects/ansible-role-java'));
    scheduler.run();
}

main();