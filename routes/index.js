var express = require('express');
var router = express.Router();
// const cron = require('node-cron');

//modules
var index = require('../modules/index');
var auth = require('../modules/auth');
var member = require('../modules/members');
var account = require('../modules/accounts');


router.get('/', index.check_db);

//check DB
router.get('/ping', index.check_db);

// LOGIN
router.post('/login', auth.checkUser);

// Member
router.get('/memberlist', member.memberListPaging);
router.get('/members', member.memberList);
router.get('/memberByID/:id', member.memberByID);
router.post('/memberadd', member.addMember);
router.post('/memberedit', member.editMember);
router.post('/memberdelete', member.deleteMember);
router.post('/memberstatus', member.activateMember);

// Account
router.get('/accountlist', account.accountListPaging);
router.get('/accounts', account.accountList);
router.get('/accountByID/:id', account.accountByID);
router.post('/accountadd', account.addAccount);
router.post('/accountedit', account.editAccount);
router.get('/accountPassByID/:id', account.accountPasswordByID);
router.post('/accountChangePass', account.changePassword);
router.post('/accountdelete', account.deleteAccount);
router.post('/accountstatus', account.activateAccount);


module.exports = router;
