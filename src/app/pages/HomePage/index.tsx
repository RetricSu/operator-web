import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Grid, TextField, Button } from '@mui/material';

export const styles = {
  root: {
    maxWidth: '1000px',
    fontSize: '20px',
    margin: '0 auto',
  },
  loginBox: {
    border: '1px solid gray',
  },
  chatRoom: {
    padding: '20px',
    background: 'whitesmoke',
    minHeight: '500px',
    width: '100%',
    fontSize: '14px',
  },
  msg: {
    border: '1px solid black',
    padding: '5px',
    margin: '5px 0',
  },
  loginInfo: {
    color: 'powderblue',
    padding: '10px',
    background: 'whitesmoke',
    textAlign: 'center' as const,
  },
};

export function HomePage() {
  const [privKey, setPrivkey] = useState<string>();
  const [roomId, setRoomId] = useState<string>();
  const privKeyInput = React.useRef<HTMLInputElement>(null);
  const roomIdInput = React.useRef<HTMLInputElement>(null);

  const handlePrivKeyAndRoomId = async () => {
    const pk = privKeyInput.current?.value;
    const rd = roomIdInput.current?.value;
    if (pk == null || rd == null) return;

    setPrivkey(pk);
    setRoomId(rd);
  };

  return (
    <>
      <Helmet>
        <title>ChatApp</title>
        <meta name="description" content="A P2P chat application" />
      </Helmet>
      <div style={styles.root}>
        <h1>Operator Chat app</h1>
        <Grid container spacing={2}>
          <Grid item xs={6} style={styles.loginBox}>
            <p>
              privKey: <input type="text" ref={privKeyInput} /> (Only for demo)
            </p>
            <p>
              roomId: <input type="text" ref={roomIdInput} />
            </p>
            <p>
              <Button onClick={handlePrivKeyAndRoomId} variant="outlined">
                start
              </Button>
            </p>
          </Grid>
          <Grid item xs={6} style={styles.loginInfo}>
            {privKey && (
              <div>
                <h4>Welcome, User {privKey}</h4>
                <p>
                  <small>have a good and private group chat!</small>
                </p>
              </div>
            )}
          </Grid>
        </Grid>

        <br />
        <br />
        <br />
        <div>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <p>Write Msg</p>
              <TextField
                placeholder="what you thinking.."
                multiline
                rows={8}
                fullWidth
              />
              <p>
                <Button variant="outlined">send</Button>
              </p>
            </Grid>
            <Grid item xs={8}>
              <p>Chat Room</p>
              <div style={styles.chatRoom}>
                <div style={styles.msg}>
                  <p>
                    <small>user1 @11.12</small>
                  </p>
                  <p>hello, chat rooms!</p>
                </div>
                <div style={styles.msg}>
                  <p>
                    <small>user1 @11.12</small>
                  </p>
                  <p>hello, chat rooms!</p>
                </div>
                <div style={styles.msg}>
                  <p>
                    <small>user1 @11.12</small>
                  </p>
                  <p>hello, chat rooms!</p>
                </div>
                <div style={styles.msg}>
                  <p>
                    <small>user1 @11.12</small>
                  </p>
                  <p>hello, chat rooms!</p>
                </div>
                <div style={styles.msg}>
                  <p>
                    <small>user1 @11.12</small>
                  </p>
                  <p>hello, chat rooms!</p>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
}
