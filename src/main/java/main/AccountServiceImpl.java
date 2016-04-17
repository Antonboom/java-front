package main;

import db.UserDataSet;
import db.UserDataSetDAO;
import org.hibernate.HibernateException;
import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;

/**
 * @author iu6team
 */
public class AccountServiceImpl implements AccountService {
    private final Map<main.Session, UserDataSet> sessions = new ConcurrentHashMap<>();
    private final SessionFactory sessionFactory;
    private final ScheduledExecutorService killerExecutor = Executors.newSingleThreadScheduledExecutor();

    private final long EXPIRES_MIN = 10;

    private final Runnable sessionKiller = () -> {
        sessions.forEach((session, user) -> {
            long timeLiving = System.currentTimeMillis() - session.getCreationTime();
            if (session.isDeath() && (timeLiving > EXPIRES_MIN * 1000 * 60)) {
                sessions.remove(session);
            }
        });
    };

    public AccountServiceImpl() {
        Configuration configuration = new Configuration();
        configuration.addAnnotatedClass(UserDataSet.class);
        configuration.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        configuration.setProperty("hibernate.connection.driver_class", "com.mysql.jdbc.Driver");
        configuration.setProperty("hibernate.connection.url", "jdbc:mysql://localhost:3306/javaDB");
        configuration.setProperty("hibernate.connection.username", "root");
        configuration.setProperty("hibernate.connection.password", "mysql");
        configuration.setProperty("hibernate.show_sql", "true");
        configuration.setProperty("hibernate.hbm2ddl.auto", "create");
        sessionFactory = createSessionFactory(configuration);

        killerExecutor.scheduleAtFixedRate(sessionKiller, 0, 1, TimeUnit.MINUTES);
    }

    @Override
    public List<UserDataSet> getAllUsers() {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            return dao.getAllUsers();
        }
    }

    @Override
    public boolean addUser(UserDataSet userProfile) {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            if (dao.getUserByLogin(userProfile.getLogin()) != null || dao.getUserByEmail(userProfile.getEmail()) != null) {
                return false;
            } else {
                dao.addUser(userProfile);
                return true;
            }
        }
    }

    @Override
    public UserDataSet getUser(long id) {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            return dao.getUser(id);
        }
    }
    @Override
    public UserDataSet getUserByLogin(String login) {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            return dao.getUserByLogin(login);
        }
    }

    @Override
    public void editUser(long id, UserDataSet user, String sessionId){
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            dao.editUser(user, id);
            sessions.replace(new main.Session(sessionId), user);
        }
    }

    @Override
    public boolean deleteSession(main.Session session){
        if(checkAuth(session)){
            sessions.remove(session);
            return true;
        }
        else {
            return false;
        }
    }

    @Override
    public boolean isExists(@NotNull UserDataSet user) {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            return (dao.getUserByLogin(user.getLogin()) != null);
        }
    }

    @Override
    public void addSession(main.Session session, UserDataSet user) {
        sessions.put(session, user);
    }

    @Override
    public boolean checkAuth(main.Session sessionReq) {
        return sessions.containsKey(sessionReq);
    }

    @Override
    public UserDataSet giveProfileFromSession(main.Session session) {
        return sessions.get(session);
    }

    @Override
    public void deleteUser(long id) {
        try (Session session = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(session);
            dao.deleteUser(id);
        }
    }

    @Override
    public String getIdByJson(long id) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("id", id);
        return jsonObject.toString();
    }

    @Override
    public String getIdAndAvatar(long id, String avatar) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("id", id);
        jsonObject.put("avatar", avatar);
        return jsonObject.toString();
    }

    @Override
    public String toJson(UserDataSet user) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("id", user.getId());
        jsonObject.put("login", user.getLogin());
        jsonObject.put("email", user.getEmail());
        jsonObject.put("avatar", user.getAvatar());
        return jsonObject.toString();
    }
    @Override
    public String toJsonError(String error) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("error:", error);
        return jsonObject.toString();
    }

    public Map<main.Session, UserDataSet> getSessions() { return sessions; }

    private static SessionFactory createSessionFactory(Configuration configuration) {
        StandardServiceRegistryBuilder builder = new StandardServiceRegistryBuilder();
        builder.applySettings(configuration.getProperties());
        try {
            ServiceRegistry serviceRegistry = builder.build();
            return configuration.buildSessionFactory(serviceRegistry);
        } catch(HibernateException e) {
            System.err.println("Can't connect to MySQL " + e);
            System.exit(1);
            throw e;
        }
    }
}
