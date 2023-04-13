/* global describe it beforeEach, afterEach */

import shell from 'shelljs'
import fs from 'fs'
import { cmdParser } from '../command'
import cli from '../index';
import { Task } from '../lib/opts/types';

require('chai').should()

function exec (opt?: string) {
  const argv = cmdParser.parseSync(`commit-and-tag-version ${opt} --silent`)
  argv.skip = [Task.commit, Task.tag];
  return cli(argv)
}

describe('presets', () => {
  beforeEach(function () {
    shell.rm('-rf', 'tmp')
    shell.config.silent = true
    shell.mkdir('tmp')
    shell.cd('./tmp')
    shell.exec('git init')
    shell.exec('git config commit.gpgSign false')
    shell.exec('git config core.autocrlf false')
    shell.exec('git commit --allow-empty -m "initial commit"')
    shell.exec('git commit --allow-empty -m "feat: A feature commit."')
    shell.exec('git commit --allow-empty -m "perf: A performance change."')
    shell.exec('git commit --allow-empty -m "chore: A chore commit."')
    shell.exec('git commit --allow-empty -m "ci: A ci commit."')
    shell.exec('git commit --allow-empty -m "custom: A custom commit."')
  })

  afterEach(function () {
    shell.cd('../')
    shell.rm('-rf', 'tmp')
  })

  it('Conventional Commits (default)', async function () {
    await exec()
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8')
    content.should.contain('### Features')
    content.should.not.contain('### Performance Improvements')
    content.should.not.contain('### Custom')
  })

  it('Angular', async function () {
    await exec('--preset angular')
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8')
    content.should.contain('### Features')
    content.should.contain('### Performance Improvements')
    content.should.not.contain('### Custom')
  })
})
