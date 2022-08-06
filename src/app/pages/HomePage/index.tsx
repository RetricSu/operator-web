import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Grid } from '@mui/material';
import 'papercss';
import {
  decrypt,
  decryptWithPrivateKey,
  encrypt,
  getPublicKeyFromPrivateKey,
} from 'service/crypto';
import { Api, decodeSimpleMsg, WsApi } from 'service/api';
import { Utf8Str } from 'types';

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

const api: Api = new Api();
let wsApi: WsApi | undefined;

export interface MsgItem {
  userId: string;
  msg: Utf8Str;
}

export function HomePage() {
  const [privKey, setPrivkey] = useState<string>();
  const [roomId, setRoomId] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [receiveMsg, setReceiveMsg] = useState<string>();
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [msgList, setMsgList] = useState<MsgItem[]>([]);
  const [aesKey, setAesKey] = useState<string>();
  const [aesIv, setAesIv] = useState<string>();

  const privKeyInput = useRef<HTMLInputElement>(null);
  const roomIdInput = useRef<HTMLInputElement>(null);
  const writeMsgInput = useRef<HTMLTextAreaElement>(null);

  const handlePrivKeyAndRoomId = async () => {
    const pk = privKeyInput.current?.value;
    const rd = roomIdInput.current?.value;
    if (pk == null || rd == null) return;

    let publicKey: string | undefined;
    try {
      publicKey = getPublicKeyFromPrivateKey(pk);
    } catch (error: any) {
      alert('illgal private key, ' + error.message);
    }
    if (publicKey == null) {
      return;
    }

    setPrivkey(pk);
    setRoomId(rd);
    //"MIICXgIBAAKBgQCRwI/ERpwG6RnlDQnR3OjJsrBm8CYj8uJCy6alPxHk2j4rqL4KFFOUDeO82TyP6R30fv3pbU3atPhLl/h+KqXEiJeU5Du2yoqgx8eL3PIrKiEJuVyvmLPN4MCnjPN3uw6SXW53ZF6Y/CDP151+g/adntarw7ReaXfhPFSiUZYLWQIDAQABAoGAIQc0zPJ/OuWps4jv17mqmsI+TSVQT0cj1KUXf0y6flSiT/xuDBStF9jJ6aqEmcvmuNfqK/JT+SKXPXITomuBop5s+SzRH988tqurQ19RtlNye1NuaF5OLMkLMLVCjpd2ENvP/GglnyB8+hDmTtHdvXiHf6t51es/DeVfokkHEXECQQDaDDhCR3Om/5gmJjTxwYNyAT6kbq/uId4M6S2MCy+OW5UIzH8CGmBEmUk70hyI8s6e3aLzq3MNn/z4zHmKzErNAkEAqx7+e5ylu75eqLu/TSbNGwELd4AlIRI8py3Bq8PKt4WYv+O6oqqyNSy0/3UhD0J/PEnpRIl9ctJoVUuFsdIavQJBAIvza+iek8yMIMvbmf/RhNyXj+1aXfEqK6t9vo40X8GvZmjPWHWxGDjvaeHLaiU8MwIkn4JmeOI13diS5TABD8ECQQCOTC3O2QqwvrO0mLuSCqwQwqOocfVuNN4fH1un3B7c0cmd+F+hGVUsBstUizA8ok1v8v55seOR8go0s6Kvpkn5AkEAu/1FQefubFReey3NGrUwYIa5JgmUCaQRsOQ67Unj3MK9TggxC5BJP9u/l0fIRRmkVUkNKOhPFQMur47qNjq34Q=="
    //"MIICWwIBAAKBgHt9IZ0CoOwy4ZwUd+kgUnbM3SlivpS78gi+bY6dgw6X06ZdosHeU64mXabrJT6vUggg5oP6VB28BbCBnQBjo10iMsk3D50hRlsp1OxfZlSE5p+sZIEKbmMBXEHt9QKTMjhyAfANXp1IdRGHJ0/Vx0OxTGOonIVJ9jWm/auTVa+TAgMBAAECgYAO2/nFeOGASocXTuc26CrEHNan+jfQkeUH5FIujQmOIfrX1ACXr3cGR5uRUE5FAreuPrc+PksM4OkWWiJYP6USjmZ4hZ3WEBiaroe9BYww/0ehvmGL7K+q0ygfxf5Z/e+OxJCijPIyNsugqWGU44xzwB20TjC0fPPG7HMN+cXNsQJBANSvKhiJFBXCvGttjJWNRapfe0aREI2IOUssrM7zdKmcjrU2+hwzLAkA/9ytBSIaYwH0vFjEM4IQco5U368k2Q0CQQCUo4jpeFO+XIKHh0RZKc6o55Z4jCRCFxFF5kB0cYz+gVGQqb9rI873t1lgIWaEoD1xz58ifpIiAUtd72vXFUMfAkBETl1+s8e3lWteNTjJby3IohG9gCmIyw9bjWWSsa3uK1HJ8XYySF0EJ0YFYawcX80ce7Vh7OF+DDo+bBPK9FKhAkAHGnmkjreR1WH3kCNYD4Ns1wR95lSlQ+zzZjmWVwbh8tQvEa2wNRnjBMQkr/PySqYlFkMIpvvc3Cr55kNFGCMJAkEArmfLUOlHBWkXKsx1obHVvhWZOkS25lAQNYo8K1LHtJ1ReVZwSj1Hj8LOzn9gYToU9LHPn4Io38nxOneGOLIXsg=="
    setPublicKey(publicKey);
  };

  const handleWriteMsg = async () => {
    const msg = writeMsgInput.current?.value;
    if (msg == null || publicKey == null) return;

    const encryptedMsg = encrypt(msg, aesKey!, aesIv!);
    await wsApi?.sendSimpleMsg(publicKey, encryptedMsg);
    writeMsgInput.current!.value = '';
  };

  const fetchAesEnvelop = async () => {
    const res = await api.getAesEnvelop(publicKey!);
    if (res == null) {
      console.error('AES envelop not found');
      return;
    }

    console.log(res);

    const aesKey = decryptWithPrivateKey(res.AESKey, privKey!);
    const aesIv = decryptWithPrivateKey(res.AESIV, privKey!);
    setAesIv(aesIv);
    setAesKey(aesKey);
  };

  useEffect(() => {
    if (privKey == null) return;

    fetchAesEnvelop();
    // connect to p2p server
    wsApi = new WsApi(undefined, {
      onMsgHandler: (event: any) => {
        console.log(event.data);
        setReceiveMsg(event.data);
      },
      onOpenHandler: () => {
        setIsWsConnected(true);
      },
    });
  }, [privKey]);

  useEffect(() => {
    if (receiveMsg == null) return;

    const item = decodeSimpleMsg(receiveMsg);
    let decryptedMsg = decrypt(item.msg, aesKey!, aesIv!);
    if (decryptedMsg == null) {
      console.error('can not decypt msg');
      decryptedMsg = 'decrypt failed..';
    }
    item['encryptedMsg'] = item.msg;
    item.msg = decryptedMsg;
    setMsgList(oldArray => [...oldArray, item]);
  }, [receiveMsg]);

  const msgListJsx = msgList.map((msg, id) => (
    <div key={id} style={styles.msg}>
      <p>
        <small>User~{msg.userId}</small>
      </p>
      <p>
        [{msg['encryptedMsg']}] {msg.msg}
      </p>
    </div>
  ));

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
                <p>
                  ws connection: {isWsConnected && <span>☑️</span>}
                  {!isWsConnected && <span>✖️</span>}
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
              <textarea
                placeholder="something on your mind.."
                id="large-input"
                rows={8}
                style={{ width: '100%' }}
                ref={writeMsgInput}
              />
              <p>
                <button onClick={handleWriteMsg} className="btn-success">
                  send
                </button>
              </p>
            </Grid>
            <Grid item xs={8}>
              <p>Chat Room</p>
              <div style={styles.chatRoom}>{msgListJsx}</div>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
}
