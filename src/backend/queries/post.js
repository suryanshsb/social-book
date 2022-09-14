/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
const express = require('express');
const Post = require('../schemas/postSchema');
const AddNFT = require('../schemas/AddNft');
const Comment = require('./../schemas/commentSchema');
const User = require('../schemas/userSchema');
const Transaction = require('../schemas/TransactionSchema');
const SavePost = require('../schemas/Save');
const router = express.Router();

//Creating a Post
router.post('/create-post', (req, res) => {
  const {caption, image, tag, wallet, username} = req.body;
  const post = new Post({caption, tag, image, wallet, username});
  post
    .save()
    .then(() => {
      res.status(201).json({message: 'Post Created Successfully'});
    })
    .catch(() => {
      res.status(500).json({message: 'Internal Server Error'});
    });
});

//Deleting a Post
router.delete('/deletepost/:postId', (req, res) => {
  Post.findOne({_id: req.params.postId})
    .deleteOne()
    .then(() => {
      res.status(201).json({message: 'Post Deleted Successfully'});
    })
    .catch(() => {
      res
        .status(500)
        .json({message: 'Internal Server Error cannot delete postc'});
    });
});

//Delete a Comment
router.delete('/delete-comment/:postid', (req, res) => {
  Comment.findOne({postId: req.params.postid})
    .deleteOne()
    .then(() => {
      res.status(201).json({message: 'Comment Deleted Successfully'});
    })
    .catch(() => {
      res
        .status(500)
        .json({message: 'Internal Server Error cannot delete Comment'});
    });
});

//Adding a NFT Minted Data in Backend
router.post('/MarketPlace', (req, res) => {
  const {image, token_name, wallet, username, description} = req.body;
  const post = new AddNFT({image, wallet, username, token_name, description});
  post
    .save()
    .then(() => {
      res.status(201).json({message: 'NFT Added Successfully'});
    })
    .catch(() => {
      res.status(500).json({message: 'Internal Server Error'});
    });
});

router.post('/save', (req, res) => {
  const {postid, username, userid, image} = req.body;
  const post = new SavePost({postid, username, userid, image});
  post
    .save()
    .then(() => {
      res.status(201).json({message: 'Post save Successfully'});
    })
    .catch(() => {
      res.status(500).json({message: 'Internal Server Error'});
    });
});

//Getting Posts for a particular User
router.get('/posts/:uid', async (req, res) => {
  const wallet = req.params.uid;
  const user_posts = await Post.find({wallet: wallet}).then((doc) => {
    if (!doc) {
      res.status(404).json({message: 'No Posts Found'});
    } else {
      res.status(203).json({doc});
    }
  });
});

//Getting Save Posts data
router.get('/savepost', async (req, res) => {
  const user_posts = await SavePost.find().then((doc) => {
    if (!doc) {
      res.status(404).json({message: 'No saved Posts Found'});
    } else {
      res.status(203).json({doc});
    }
  });
});

//Getting Transactions for a particular User
router.get('/transcation/:uid', async (req, res) => {
  const user_id = req.params.uid;
  const user_transaction = await Transaction.find({userId: user_id})
    .sort({createdAt: -1})
    .then((doc) => {
      if (!doc) {
        res.status(404).json({message: 'No transcation Found'});
      } else {
        res.status(203).json({doc});
      }
    });
});

//Getting user saved post
router.get('/saved-post/:username', async (req, res) => {
  const username = req.params.username;
  const user_transaction = await SavePost.find({username: username})
    .sort({createdAt: -1})
    .then((doc) => {
      if (!doc) {
        res.status(404).json({message: 'No Saved post Found'});
      } else {
        res.status(203).json({doc});
      }
    });
});
//delete saved post

router.delete('/delete-savedpost/:postid', (req, res) => {
  SavePost.findOne({postid: req.params.postid})
    .deleteOne()
    .then(() => {
      res.status(201).json({message: 'Saved Post Deleted Successfully'});
    })
    .catch(() => {
      res
        .status(500)
        .json({message: 'Internal Server Error cannot delete Saved Post'});
    });
});

//Showings Users of App
router.get('/users', (req, res) => {
  const usersData = User.find()
    .then((doc) => {
      if (!doc) {
      } else {
        res.json(doc);
      }
    })
    .catch((err) => {
      res.status(500).json({error: 'No Data Found'});
    });
});

//get selected user
router.get('/getusers/:wallet', async (req, res) => {
  const userwallet = req.params.wallet;
  const user_transaction = await User.find({wallet: userwallet})
    .sort({createdAt: -1})
    .then((doc) => {
      if (!doc) {
        res.status(404).json({message: 'No Saved post Found'});
      } else {
        res.status(203).json({doc});
      }
    });
});

//Function for search of users
router.get('/search', (req, res) => {
  const usersData = User.find()
    .then((doc) => {
      if (!doc) {
        res.status(404).json({message: 'No transcation Found'});
      } else {
        res.json(doc);
      }
    })
    .catch((err) => {
      res.status(500).json({error: 'No Data Found'});
    });
});

router.get('/posts', async (req, res) => {
  const posts = await Post.find()
    .then((doc) => {
      if (!doc) {
        res.status(404).json({message: 'No Posts Found'});
      } else {
        res.json(doc);
      }
    })
    .catch((err) => {
      res.status(500).json({error: 'No Data Found'});
    });
});

//home page post
router.get('/', async (req, res) => {
  const doc = [];
  const posts = Post.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'username',
        foreignField: 'username',
        as: 'user_details',
      },
    },
  ]).then((data) => {
    doc.push(...data);
    const nft_posts = AddNFT.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'username',
          foreignField: 'username',
          as: 'user_details',
        },
      },
    ]).then((results) => {
      doc.push(...results);
      doc.sort((a, b) => b.createdAt - a.createdAt);
      res.json({doc});
    });
  });
});

//Getting users profile Details
router.get('/:uid', async (req, res) => {
  const Data = {
    users: {},
    numbers: '',
  };
  const wallet = req.params.uid;
  const userdata = await User.find({wallet: wallet})
    .limit(1)
    .then((doc) => {
      Data.users = doc;

      if (doc[0] == undefined) {
        res.status(500).json({message: 'No Users Found'});
      } else {
        const Count = Post.find({wallet: wallet})
          .count()
          .then((posts) => {
            Data.numbers = posts.toString();
            res.status(200).json(Data);
          });
      }
    });
});

//upload user pic
router.post('/user_pic', async (req, res) => {
  const UserPic = await User.findOneAndUpdate(
    {wallet: req.body.wallet},
    {
      $set: {
        profile_url: req.body.url,
      },
    },
    {
      upsert: true,
      returnDocument: 'after', // this is new !
    }
  )
    .then((doc) => {
      res.status(200).json({message: 'Updated'});
    })
    .catch((err) => {
      res.status(500).json({message: 'Error'});
    });
});

//Get Single Post
router.get('/p-self/:postid', (req, res) => {
  const post = req.params.postid;
  const postdata = Post.findById(post)
    .then((doc) => {
      const userdata = User.find({username: doc.username}).then((doc2) => {
        if (!doc || !doc2) {
          res.status(404).json({message: 'Post Not Found'});
        } else {
          res.status(201).json([doc, doc2]);
        }
      });
    })
    .catch((err) => {
      res.status(404).json({message: 'Post Not Found'});
    });
});

//Post a comment
router.post('/add-comment', async (req, res) => {
  try {
    const {content, user, postId} = req.body;

    const post = await Post.findById(postId).exec();
    if (!post) return res.status(400).json({msg: 'This Post does not exist.'});

    const newComment = new Comment({
      content,
      user,
      postId,
    });

    await Post.findOneAndUpdate(
      {_id: postId},
      {
        $push: {comment: newComment._id},
      },
      {new: true}
    );

    await newComment.save();

    res.json({
      newComment,
    });
  } catch (err) {
    return res.status(500).json({msg: err.message});
  }
});

//Show users Self-NFTS
router.get('/Self-NFT/:uid', async (req, res) => {
  const userid = req.params.uid;
  const selfnfts = AddNFT.find({wallet: userid})
    .sort({createdAt: -1})
    .then((doc) => {
      if (!doc) {
        res.status(500);
      } else {
        res.json(doc);
      }
    });
});

module.exports = router;
