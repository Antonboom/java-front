package tests;

import db.UserDataSet;
import db.UserDataSetDAO;
import main.AccountServiceImpl;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

/**
 * Created by iu6team on 30.03.16.
 */
@FixMethodOrder(MethodSorters.JVM)
public class AccountServiceImplTest {
    private AccountServiceImpl accountService;
    private SessionFactory sessionFactory;
    private UserDataSet admin;
    private UserDataSet test;

    @Before
    public void setUp() throws HibernateException {
        accountService = new AccountServiceImpl();

        Configuration configuration = new Configuration();
        configuration.addAnnotatedClass(UserDataSet.class);
        configuration.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        configuration.setProperty("hibernate.connection.driver_class", "com.mysql.jdbc.Driver");
        configuration.setProperty("hibernate.connection.url", "jdbc:mysql://localhost:3306/javaDB");
        configuration.setProperty("hibernate.connection.username", "root");
        configuration.setProperty("hibernate.connection.password", "1");
        configuration.setProperty("hibernate.show_sql", "true");
        configuration.setProperty("hibernate.hbm2ddl.auto", "create");
        sessionFactory = createSessionFactory(configuration);

        try (Session testSession = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(testSession);
            admin = new UserDataSet();
            admin.setLogin("admin");
            admin.setEmail("admin@mail.ru");
            admin.setPassword("111");
            test = new UserDataSet();
            test.setLogin("test");
            test.setEmail("test@mail.ru");
            test.setPassword("test");
            dao.addUser(admin);
            dao.addUser(test);
        }
    }


    @Test
    public void testGetUser() throws HibernateException {
        UserDataSet userTemp = accountService.getUser(1);
        assertEquals(admin, userTemp);
    }

    @Test
    public void testGetAllUsers() throws Exception {
        List<UserDataSet> usersList = accountService.getAllUsers();
        UserDataSet userTemp = usersList.get(0);
        UserDataSet userTemp2 = usersList.get(1);
        assertEquals(admin, userTemp);
        assertEquals(test, userTemp2);
    }

    @Test
    public void testAddUser() throws HibernateException {
        UserDataSet newUser = new UserDataSet();
        newUser.setLogin("qwerty");
        newUser.setEmail("qwerty@mail.ru");
        newUser.setPassword("123");
        accountService.addUser(newUser);
        try (Session testSession = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(testSession);
            UserDataSet user = dao.getUser(accountService.getUserByLogin(newUser.getLogin()).getId());
            assertEquals(newUser, user);
        }
    }

    @Test
    public void testAddExistingUser() {
        UserDataSet existingUser = new UserDataSet();
        existingUser.setLogin("admin");
        existingUser.setEmail("admin@mail.ru");
        existingUser.setPassword("111");
        assertEquals(false, accountService.addUser(existingUser));
    }

    @Test
    public void testGetUserByLogin() throws Exception {
        UserDataSet temp = accountService.getUserByLogin("test");
        assertEquals(test, temp);
    }

    @Test
    public void testEditUser() throws HibernateException {
        UserDataSet newUser = new UserDataSet();
        newUser.setId(2);
        newUser.setLogin("555");
        newUser.setEmail("555@555.com");
        newUser.setPassword("555");
        accountService.editUser(2, newUser, "555");
        try (Session testSession = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(testSession);
            UserDataSet user = dao.getUser(newUser.getId());
            assertEquals(newUser, user);
        }
    }

    @Test
    public void testAddSession() {
        accountService.addSession("session", test);
        Map<String, UserDataSet> sessions = accountService.getSessions();
        assertTrue(sessions.containsValue(test));
    }

    @Test
    public void testDeleteSession() throws Exception {
        accountService.addSession("session", test);
        accountService.deleteSession("session");
        Map<String, UserDataSet> sessions = accountService.getSessions();
        assertFalse(sessions.containsValue(test));
    }

    @Test
    public void testIsExists() throws Exception {
        List<UserDataSet> usersList = accountService.getAllUsers();
        UserDataSet userTemp = usersList.get(0);
        UserDataSet userTemp2 = new UserDataSet();
        userTemp2.setId(5);
        userTemp2.setLogin("qwerty");
        userTemp2.setEmail("qwerty@mail.ru");
        assertTrue(accountService.isExists(userTemp));
        assertFalse(accountService.isExists(userTemp2));
    }


    @Test
    public void testCheckAuth() throws Exception {
        assertFalse(accountService.checkAuth("123"));
        accountService.addSession("123", test);
        assertTrue(accountService.checkAuth("123"));
    }

    @Test
    public void testGiveProfileFromSessionId() throws HibernateException {
        accountService.addSession("123", test);
        UserDataSet temp = accountService.giveProfileFromSessionId("123");
        assertEquals(test, temp);
    }

    @Test
    public void testDeleteUser() throws HibernateException {
        accountService.deleteUser(1);
        try (Session testSession = sessionFactory.openSession()) {
            UserDataSetDAO dao = new UserDataSetDAO(testSession);
            UserDataSet user = dao.getUser(1);
            assertEquals(null, user);
        }
    }


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