const Account = require('../models/Account');
const IncomeProject = require('../models/IncomeProject');
const Loan = require('../models/Loan');
const User = require('../models/User');

const getOverviewStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const isSuperAdmin = req.user.role === 'super-admin';

    // ── PERSONAL STATS ────────────────────────────────────────────────────────

    // Passwords — grouped by category
    const userPasswords = await Account.find({ user: userId });
    const passwordCategoryMap = {};
    userPasswords.forEach(p => {
      const cat = p.category || 'Others';
      passwordCategoryMap[cat] = (passwordCategoryMap[cat] || 0) + 1;
    });

    // Projects — own + partner
    const myProjects = await IncomeProject.find({ createdBy: userId });
    const partnerProjects = await IncomeProject.find({
      createdBy: { $ne: userId },
      'contributors.email': req.user.email
    });
    const projectStatusMap = {};
    [...myProjects, ...partnerProjects].forEach(p => {
      projectStatusMap[p.status] = (projectStatusMap[p.status] || 0) + 1;
    });
    const myProjectTotal = myProjects.reduce((s, p) => s + (p.totalAmount || 0), 0);
    const partnerTotal = partnerProjects.reduce((s, p) => s + (p.totalAmount || 0), 0);

    // Loans — personal
    const myLoans = await Loan.find({ createdBy: userId });
    const loansGiven = myLoans.filter(l => l.loanType === 'given');
    const loansTaken = myLoans.filter(l => l.loanType === 'taken');
    const loanStatusMap = {};
    myLoans.forEach(l => {
      loanStatusMap[l.status] = (loanStatusMap[l.status] || 0) + 1;
    });

    const personal = {
      passwords: {
        total: userPasswords.length,
        byCategory: passwordCategoryMap
      },
      projects: {
        total: myProjects.length + partnerProjects.length,
        myProjects: myProjects.length,
        partnerProjects: partnerProjects.length,
        totalRevenue: myProjectTotal + partnerTotal,
        byStatus: projectStatusMap
      },
      loans: {
        total: myLoans.length,
        totalGiven: loansGiven.reduce((s, l) => s + l.amount, 0),
        totalTaken: loansTaken.reduce((s, l) => s + l.amount, 0),
        totalPaid: loansGiven.reduce((s, l) => s + (l.amount - l.remainingAmount), 0),
        totalReceived: loansTaken.reduce((s, l) => s + (l.amount - l.remainingAmount), 0),
        byStatus: loanStatusMap
      }
    };

    // ── PLATFORM STATS (super-admin only) ────────────────────────────────────
    let platform = null;
    if (isSuperAdmin) {
      const [allAccounts, allProjects, allLoans, allUsers] = await Promise.all([
        Account.find({}),
        IncomeProject.find({}),
        Loan.find({}),
        User.find({})
      ]);

      const platformPwdCategoryMap = {};
      allAccounts.forEach(p => {
        const cat = p.category || 'Others';
        platformPwdCategoryMap[cat] = (platformPwdCategoryMap[cat] || 0) + 1;
      });

      const platformProjectStatusMap = {};
      allProjects.forEach(p => {
        platformProjectStatusMap[p.status] = (platformProjectStatusMap[p.status] || 0) + 1;
      });

      const platformLoanStatusMap = {};
      allLoans.forEach(l => {
        platformLoanStatusMap[l.status] = (platformLoanStatusMap[l.status] || 0) + 1;
      });

      platform = {
        totalUsers: allUsers.length,
        passwords: {
          total: allAccounts.length,
          byCategory: platformPwdCategoryMap
        },
        projects: {
          total: allProjects.length,
          totalRevenue: allProjects.reduce((s, p) => s + (p.totalAmount || 0), 0),
          byStatus: platformProjectStatusMap
        },
        loans: {
          total: allLoans.length,
          totalGiven: allLoans.filter(l => l.loanType === 'given').reduce((s, l) => s + l.amount, 0),
          totalTaken: allLoans.filter(l => l.loanType === 'taken').reduce((s, l) => s + l.amount, 0),
          byStatus: platformLoanStatusMap
        }
      };
    }

    res.json({ success: true, personal, platform });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOverviewStats };
