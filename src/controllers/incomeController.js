const IncomeProject = require('../models/IncomeProject');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, client, description, totalAmount, date, status, contributors } = req.body;
    
    // Process contributors to link existing users
    const processedContributors = await Promise.all(
      contributors.map(async (c) => {
        let userId = c.user;
        if (!userId) {
          // If manually added, check if email exists in DB
          const existingUser = await User.findOne({ email: c.email.toLowerCase() });
          if (existingUser) {
            userId = existingUser._id;
          }
        }
        return {
          user: userId || null,
          email: c.email.toLowerCase(),
          name: c.name,
          phoneNumber: c.phoneNumber || "",
          role: c.role,
          shareType: c.shareType || 'percent',
          shareValue: c.shareValue || 0,
          amount: c.amount || 0,
          paidAmount: c.paidAmount || 0
        };
      })
    );

    const project = await IncomeProject.create({
      name,
      client,
      description,
      totalAmount,
      date,
      status: status || 'In Progress',
      createdBy: req.user._id,
      contributors: processedContributors
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;
    
    const query = {};

    if (req.user.role === 'super-admin') {
      // Super-admin: 'all' = everything in DB, 'my-project' = their own, 'partner' = where they're a contributor but not creator
      if (type === 'my-project') {
        query.createdBy = req.user._id;
      } else if (type === 'partner') {
        query.createdBy = { $ne: req.user._id };
        query['contributors.email'] = req.user.email.toLowerCase();
      }
      // else type === 'all' → no filter, return everything
    } else {
      // Regular user: 'my-project', 'partner', or 'all' (own + partner)
      if (type === 'my-project') {
        query.createdBy = req.user._id;
      } else if (type === 'partner') {
        query.createdBy = { $ne: req.user._id };
        query['contributors.email'] = req.user.email.toLowerCase();
      } else {
        // 'all' for regular users = own projects + partner projects
        query.$or = [
          { createdBy: req.user._id },
          { 'contributors.email': req.user.email.toLowerCase() }
        ];
      }
    }

    // Search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { client: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await IncomeProject.countDocuments(query);
    const projects = await IncomeProject.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await IncomeProject.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization: Only creator or super-admin can edit
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
    }

    const { name, client, description, totalAmount, date, status, contributors } = req.body;

    let processedContributors = project.contributors;
    if (contributors) {
      processedContributors = await Promise.all(
        contributors.map(async (c) => {
          let userId = c.user;
          if (!userId) {
            const existingUser = await User.findOne({ email: c.email.toLowerCase() });
            if (existingUser) {
              userId = existingUser._id;
            }
          }
          return {
            user: userId || null,
            email: c.email.toLowerCase(),
            name: c.name,
            phoneNumber: c.phoneNumber || "",
            role: c.role,
            shareType: c.shareType || 'percent',
            shareValue: c.shareValue || 0,
            amount: c.amount || 0,
            paidAmount: c.paidAmount || 0
          };
        })
      );
    }

    const updated = await IncomeProject.findByIdAndUpdate(
      id,
      {
        name,
        client,
        description,
        totalAmount,
        date,
        status,
        contributors: processedContributors
      },
      { new: true }
    );

    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject
};
