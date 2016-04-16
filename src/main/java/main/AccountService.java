package main;

import org.jetbrains.annotations.NotNull;
import db.UserDataSet;
import java.util.List;

/**
 * Created by qwerty on 28.03.16.
 */
public interface AccountService {
    List<UserDataSet> getAllUsers();
    boolean addUser(UserDataSet userProfile);
    UserDataSet getUser(long id);
    UserDataSet getUserByLogin(String login);
    void editUser(long id, UserDataSet user, String sessionId);
    boolean deleteSession(main.Session session);
    boolean isExists(@NotNull UserDataSet user);
    void addSession(main.Session session, UserDataSet user);
    boolean checkAuth(main.Session session);
    UserDataSet giveProfileFromSessionId(String sessionId);
    void deleteUser(long id);
    String getIdByJson(long id);
    String getIdAndAvatar(long id, String avatar);
    String toJson(UserDataSet user);
    String toJsonError(String error);
}
