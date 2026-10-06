import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return <div className="center">불러오는 중...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <Chat user={user} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      console.error(error);

      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleLogin}>
        <h1>Messenger</h1>

        <p className="login-description">
          이메일과 비밀번호로 로그인하세요.
        </p>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const messagesRef = collection(db, "messages");

    const q = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages(newMessages);
      },
      (error) => {
        console.error("메시지 불러오기 오류:", error);
      }
    );

    return unsubscribe;
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const message = text.trim();

    if (!message || sending) {
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "messages"), {
        text: message,
        senderId: user.uid,
        senderEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setText("");
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      alert("메시지를 보내지 못했습니다.");
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId, senderId) => {
    if (senderId !== user.uid) {
      return;
    }

    const confirmed = window.confirm(
      "이 메시지를 삭제할까요?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "messages", messageId)
      );
    } catch (error) {
      console.error("메시지 삭제 오류:", error);
      alert("메시지를 삭제하지 못했습니다.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <h1>Messenger</h1>
          <span>{user.email}</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </header>

      <main className="messages">
        {messages.length === 0 ? (
          <div className="empty-message">
            아직 메시지가 없습니다.
          </div>
        ) : (
          messages.map((message) => {
            const isMine =
              message.senderId === user.uid;

            return (
              <div
                key={message.id}
                className={`message-row ${
                  isMine ? "mine" : "other"
                }`}
              >
                <div className="message-content">
                  <div className="message-bubble">
                    {message.text}
                  </div>

                  {isMine && (
                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteMessage(
                          message.id,
                          message.senderId
                        )
                      }
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      <form
        className="message-input-area"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}

export default App;