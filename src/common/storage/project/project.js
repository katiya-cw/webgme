/*globals define*/
/*jshint browser: true, node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'common/storage/project/interface',
    'common/storage/project/branch',
    'common/util/assert'
    //'q'
], function (ProjectInterface, Branch, ASSERT) {
    'use strict';

    function Project(projectId, storage, mainLogger, gmeConfig) {
        var self = this;
        this.branches = {};

        ProjectInterface.call(this, projectId, storage, mainLogger, gmeConfig);

        // Functions defined in ProjectInterface
        this.makeCommit = function (branchName, parents, rootHash, coreObjects, msg, callback) {
            return storage.makeCommit(self.projectId, branchName, parents, rootHash, coreObjects, msg, callback);
        };

        this.setBranchHash = function (branchName, newHash, oldHash, callback) {
            storage.setBranchHash(self.projectId, branchName, newHash, oldHash, callback);
        };

        this.getBranchHash = function (branchName, callback) {
            storage.getBranchHash(self.projectId, branchName, callback);
        };

        this.createBranch = function (branchName, newHash, callback) {
            storage.createBranch(self.projectId, branchName, newHash, callback);
        };

        this.getBranches = function (callback) {
            storage.getBranches(self.projectId, callback);
        };

        this.getCommits = function (before, number, callback) {
            storage.getCommits(self.projectId, before, number, callback);
        };

        this.getCommonAncestorCommit = function (commitA, commitB, callback) {
            storage.getCommonAncestorCommit(self.projectId, commitA, commitB, callback);
        };
    }

    Project.prototype = Object.create(ProjectInterface.prototype);
    Project.prototype.constructor = Project;

    return Project;
});