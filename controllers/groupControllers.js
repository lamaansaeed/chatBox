// controllers/groupController.js
const { where } = require("sequelize");
const Group = require("../models/Group");
const GroupUser = require("../models/GroupUser");
const GroupInvitation = require("../models/GroupInvitation");
const User = require ("../models/User");
const Message = require("../models/Message");

// Check if group name is unique
exports.checkGroupName = async (req, res) => {
  const { groupName } = req.body;

  try {
    const groupExists = await Group.findOne({ where: { name: groupName } });
    if (groupExists) {
      return res.status(200).json({ isUnique: false });
    }
    return res.status(200).json({ isUnique: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Create a new group
exports.createGroup = async (req, res) => {
  const { groupName } = req.body;

  try {
    // Check again to prevent race conditions
    const groupExists = await Group.findOne({ where: { name: groupName } });
    if (groupExists) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    // Create new group
    const newGroup = await Group.create({
      name: groupName,
      userId: req.user.userId,
    });
    console.log(newGroup);
    if (newGroup) {
      await GroupUser.create({
        role: "owner",
        userId: newGroup.userId,
        groupId: newGroup.groupId,
      });
    }

    return res
      .status(201)
      .json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.fetchGroup = async (req, res) => {
  const userId = req.user.userId;

  try {
    const Groups = await Group.findAll({ where: { userId } });

    const ownedGroups = [];
    const memberGroups = [];
    for (const group of Groups) {
      const grp = await GroupUser.findOne({
        where: { groupId: group.groupId },
      });

      if (grp.role === "owner") {
        var ownerOfGroup = await Group.findOne({
          where: { groupId: grp.groupId },
        });
        ownedGroups.push(ownerOfGroup);
      } else {
        var memberOfGroup = await Group.findOne({
          where: { groupId: grp.groupId },
        });
        memberGroups.push(memberOfGroup);
      }
    }

    console.log(ownedGroups);
    res.json({
      ownedGroups,
      memberGroups, // Extract group info
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load groups" });
  }
};

exports.fetchGroupMessage = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const messages = await Message.findAll({
      where: { groupId },
      limit: 10,
      order: [["createdAt", "DESC"]],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages" });
  }
};
exports.sendGroupMessage = async (req, res) => {
  const { content } = req.body;
  const groupId = req.params.groupId;
  const userId = req.user.userId;
  const username = req.user.username;

  try {
    await Message.create({ content, groupId, userId, username });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};
// get the groups of the user who is viewing the other user on the screen to send invite
exports.getUserGroups = async (req, res) => {
  const userId = req.user.userId;
  // Extract only the Group details
  const ownedGroups = [];

  try {
    const groups = await GroupUser.findAll({
      where: { userId: userId, role: "owner" },
    });
    for (const group of groups) {
      ownedGroups.push(
        await Group.findOne({ where: { groupId: group.groupId } })
      );
    }

    res.json(ownedGroups);
  } catch (error) {
    console.error("Error fetching user-owned groups:", error);
    res.status(500).json({ error: "Failed to fetch user-owned groups" });
  }
};
//get the groups of the user you searched for to request for a group member
exports.getGroupsOfuser = async(req,res)=>{
  const userId = req.query.userId;
  const ownedGroups =[];
  console.log('fetching groups')
  try{
    const groups = await GroupUser.findAll({
      where:{userId:userId, role:"owner"}
    });
    for(const group of groups) {
      ownedGroups.push(await Group.findOne({where:{groupId:group.groupId}}))
    }
    //console.log(ownedGroups)
    res.json(ownedGroups);
  } catch (error) {
    console.log('Error fetching group of the user you looking at :', error);
    res.status(500).json({error:"Failed to fetch groups of user you look for "});
    console.log(error)
  }
}
exports.inviteUser = async (req, res) => {
  const { groupId, userId, role } = req.body;

  try {
    const groupUser=await GroupUser.create({ groupId, userId, role });
     if(groupUser){
      await GroupInvitation.create({groupUserId:groupUser.groupUserId,status:'invited'})
     }
    res.status(201).json({ message: "Invite sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send invite" });
  }
};
exports.recievedGroupInvitiations = async (req, res) => {
  const userId = req.user.userId;
  let recievedInvitations = [];
  try {
    const invitations = await GroupUser.findAll({
      where: {
        userId: userId,
        role: "invited",
      },
    });
    for (const invitation of invitations) {
      let groupDetails = await Group.findOne({
        where: {
          groupId: invitation.groupId,
          attributes: ["name"],
        },
        include: [
          {
            model: User,
            as: "users", // Alias used in association
            attributes: ["userId", "name"],
          },
        ],
      });
      recievedInvitations.push({
        ownerName: groupDetails.users.name,
        groupName: groupDetails.name,
      });
    }
    res.status(200).json(recievedInvitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
};
exports.fetchSentInvitaions = async (req, res) => {
  try {
      const userId = req.user.userId;
      const groups = await Group.findAll({ where: { userId: userId } });
      const sentInvitations = [];
      
      if (groups) {
          for (let group of groups) {
              const groupUsers = await GroupUser.findAll({
                  where: { groupId: group.groupId, role: 'inprocess' },
                  include: [
                      {
                          model: GroupInvitation,
                          as: 'groupinvite',
                          required: true,
                          where: { status: 'invited' }
                      }
                  ]
              });

              for (let groupUser of groupUsers) {
                  const userId = groupUser.dataValues.userId; // Extracting userId
                  console.log(`Extracted userId: ${userId}`); // Log for verification
                  
                  const receiver = await User.findOne({
                      where: { userId: userId },
                      attributes: ["name"]
                  });

                  sentInvitations.push({
                      groupName: group.name,
                      receiverName: receiver.name
                  });
              }
          }
          
      }
      res.status(200).json(sentInvitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
};
exports.fetchRecievedInvitations = async (req, res)=>{
  
try {
   const receivedInvitations =[];
  const userId = req.user.userId;
  const groupUsers = await GroupUser.findAll({where:{userId:userId, role:'inprocess'},
    include: [
      {
          model: GroupInvitation,
          as: 'groupinvite',
          required: true,
          where: { status: 'invited' }
      }
  ]
})
for(let groupUser of groupUsers){
  const groupDetails = await Group.findOne({
    where:{groupId:groupUser.groupId},
    attributes:["name","userId"]
  })
  const groupOwner = await User.findOne({where:{userId: groupDetails.userId},attributes:["name"]})
  receivedInvitations.push({
    groupName: groupDetails.name,
    ownerName: groupOwner.name
});
}
res.status(200).json(receivedInvitations);
} catch (error) {
  res.status(500).json({ error: "Failed to fetch invitations" });
}
}