/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { Avatar, Divider } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Comments.scss';
import moment from 'moment';
import { Delete } from '@mui/icons-material';
// import { format } from 'timeago.js';

const Comments = () => {
  const postid = useParams();
  const [user, setUser] = useState({});
  useEffect(() => {
    if (sessionStorage.getItem('user') !== null) {
      setUser(JSON.parse(sessionStorage.getItem('user')));
    } else {
      setUser();
    }
  }, []);
  const [comments, setComments] = useState([]);

  const getComments = async () => {
    await axios
      .get('http://localhost:5001/get-comments/' + postid.postid)
      .then((res) => {
        setComments(res.data);
        console.log(comments);
      });
  };
  const deletePost = async (postid) => {
    await axios
      .delete('http://localhost:5001/delete-comment/' + postid)
      .then((res) => {
        window.location.reload();
      });
    // window.location.reload();
  };
  useEffect(() => {
    getComments();
  }, []);

  return (
    <>
      {console.log(user)}
      <div className="container">
        <div className="comments">
          <section className="comments-display">
            {comments.length === 0 ? (
              <>
                <h3>No Comments Found</h3>
              </>
            ) : (
              <>
                <div className="user-details">
                  <ul>
                    {comments.map((comment) => (
                      <>
                        <li>
                          <div className="user-col">
                            {comment.user_details.map((user, index) => (
                              <>
                                {user.profile_url === null ? (
                                  <>
                                    <Avatar
                                      alt="Profile Image"
                                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                      sx={{ width: 26, height: 26 }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Avatar
                                      alt="Profile Image"
                                      src={user.profile_url}
                                      sx={{ width: 26, height: 26 }}
                                    />
                                  </>
                                )}
                                <b>{user.username}</b>
                                <text>
                                  {moment(comment.createdAt).fromNow()}
                                </text>
                              </>
                            ))}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <text>{comment.content}</text>
                            {user._id == comment.user ? (
                              <button
                                type="submit"
                                style={{
                                  backgroundColor: '#f00',
                                  width: '50px',
                                  display: 'flex',
                                  border: 'none',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  borderRadius: '5px',
                                }}
                                onClick={() => {
                                  deletePost(comment.postId);
                                }}>
                                <Delete />
                              </button>
                            ) : (
                              <></>
                            )}
                          </div>
                        </li>
                        <Divider style={{ backgroundColor: '#fff' }} />
                      </>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Comments;
