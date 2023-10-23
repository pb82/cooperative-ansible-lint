# Cooperative ansible-lint scheduler

The idea is to split up large ansible roles into batches of files and process them one by one.
To make sure small jobs are not blocked by large ones, jobs are implemented as generator functions that yield back execution to the scheduler after each batch.
