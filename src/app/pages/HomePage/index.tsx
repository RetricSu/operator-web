import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Grid } from '@mui/material';
import 'papercss';
import { getPublicKeyFromPrivateKey } from 'service/crypto';

export const styles = {
  root: {
    maxWidth: '1000px',
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
  const [publicKey, setPublicKey] = useState<string>();
  const privKeyInput = useRef<HTMLInputElement>(null);
  const roomIdInput = useRef<HTMLInputElement>(null);

  const handlePrivKeyAndRoomId = async () => {
    const pk = privKeyInput.current?.value;
    const rd = roomIdInput.current?.value;
    if (pk == null || rd == null) return;

    setPrivkey(pk);
    setRoomId(rd);
  };

  useEffect(() => {
    if (privKey == null) return;

    //"MIICWwIBAAKBgHt9IZ0CoOwy4ZwUd+kgUnbM3SlivpS78gi+bY6dgw6X06ZdosHeU64mXabrJT6vUggg5oP6VB28BbCBnQBjo10iMsk3D50hRlsp1OxfZlSE5p+sZIEKbmMBXEHt9QKTMjhyAfANXp1IdRGHJ0/Vx0OxTGOonIVJ9jWm/auTVa+TAgMBAAECgYAO2/nFeOGASocXTuc26CrEHNan+jfQkeUH5FIujQmOIfrX1ACXr3cGR5uRUE5FAreuPrc+PksM4OkWWiJYP6USjmZ4hZ3WEBiaroe9BYww/0ehvmGL7K+q0ygfxf5Z/e+OxJCijPIyNsugqWGU44xzwB20TjC0fPPG7HMN+cXNsQJBANSvKhiJFBXCvGttjJWNRapfe0aREI2IOUssrM7zdKmcjrU2+hwzLAkA/9ytBSIaYwH0vFjEM4IQco5U368k2Q0CQQCUo4jpeFO+XIKHh0RZKc6o55Z4jCRCFxFF5kB0cYz+gVGQqb9rI873t1lgIWaEoD1xz58ifpIiAUtd72vXFUMfAkBETl1+s8e3lWteNTjJby3IohG9gCmIyw9bjWWSsa3uK1HJ8XYySF0EJ0YFYawcX80ce7Vh7OF+DDo+bBPK9FKhAkAHGnmkjreR1WH3kCNYD4Ns1wR95lSlQ+zzZjmWVwbh8tQvEa2wNRnjBMQkr/PySqYlFkMIpvvc3Cr55kNFGCMJAkEArmfLUOlHBWkXKsx1obHVvhWZOkS25lAQNYo8K1LHtJ1ReVZwSj1Hj8LOzn9gYToU9LHPn4Io38nxOneGOLIXsg=="
    setPublicKey(getPublicKeyFromPrivateKey(privKey));
  }, [privKey]);

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
              privKey:{' '}
              <input
                style={{ width: '90%' }}
                type="text"
                className="input-block"
                ref={privKeyInput}
              />{' '}
              (Only for demo)
            </p>
            <p>
              roomId:{' '}
              <input
                style={{ width: '90%' }}
                type="text"
                className="input-block"
                ref={roomIdInput}
              />
            </p>
            <p>
              <button
                className="btn-secondary"
                onClick={handlePrivKeyAndRoomId}
              >
                start
              </button>
            </p>
          </Grid>
          <Grid item xs={6} style={styles.loginInfo}>
            {privKey && (
              <div>
                <h4>Welcome, User</h4>
                <p>publicKey: {publicKey?.slice(0, 16)}...</p>
                <p>privateKey: {privKey?.slice(0, 16)}...</p>
                <hr />
                <p>have a good and private group chat!</p>
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
              <textarea
                placeholder="something on your mind.."
                id="large-input"
                rows={8}
                style={{ width: '100%' }}
              />
              <p>
                <button className="btn-success">send</button>
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
