package tests;

import db.UserDataSet;
import db.UserDataSetDAO;
import main.AccountService;
import main.AccountServiceImpl;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.test.JerseyTest;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Application;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.hibernate.HibernateException;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import rest.Session;
import rest.Users;
import main.Context;

import static org.mockito.Mockito.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.core.Response;

import static org.junit.Assert.*;

/**
 * Created by iu6team on 30.03.16.
 */
@FixMethodOrder(MethodSorters.JVM)
public class AuthorizedUserTest extends JerseyTest {
    private static final int UNAUTHORIZED = 401,
                             FORBIDDEN = 403;

    private SessionFactory sessionFactory;

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

    @Override
    protected Application configure() {
        final Context context = new Context();
        context.put(AccountService.class, new AccountServiceImpl());

        final ResourceConfig config = new ResourceConfig(Users.class, Session.class);
        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpSession session = mock(HttpSession.class);

        config.register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(context);
                bind(request).to(HttpServletRequest.class);
                bind(session).to(HttpSession.class);
                when(request.getSession()).thenReturn(session);
                when(session.getId()).thenReturn("session");
            }
        });

        return config;
    }

    @Before
    public void setUpChild() throws HibernateException {
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

        org.hibernate.Session session = sessionFactory.openSession();
        UserDataSetDAO dao = new UserDataSetDAO(session);

        UserDataSet user1 = new UserDataSet(),
                    user2 = new UserDataSet();

        user1.setLogin("user1");
        user1.setEmail("user1@mail.ru");
        user1.setPassword("12345");

        user2.setLogin("user2");
        user2.setEmail("user2@mail.ru");
        user2.setPassword("54321");

        dao.addUser(user1);
        dao.addUser(user2);

        target("session").request().put(Entity.json(user1));

        session.close();
    }

    @Test
    public void testGetAllUsers() throws Exception {
        final String actualJSON = target("user").request().get(String.class),
                     expectedJSON = "[{\"email\":\"user1@mail.ru\",\"id\":1,\"login\":\"user1\",\"password\":\"12345\"}," +
                                     "{\"email\":\"user2@mail.ru\",\"id\":2,\"login\":\"user2\",\"password\":\"54321\"}]";

        assertEquals(expectedJSON, actualJSON);
    }

    @Test
    public void testGetExistUserById() throws Exception {
        final String actualJSON = target("user").path("1").request().get(String.class),
                expectedJSON = "{\"id\":1,\"login\":\"user1\",\"email\":\"user1@mail.ru\"}";

        assertEquals(expectedJSON, actualJSON);
    }

    @Test
    public void testGetNonexistUserByIdFail() throws Exception {
        final Response actualResponse = target("user").path("-30").request().get();

        assertEquals(FORBIDDEN, actualResponse.getStatus());
    }

    @Test
    public void testCreateUser() throws HibernateException {
        UserDataSet newUser = new UserDataSet();
        newUser.setLogin("admin");
        newUser.setEmail("admin@lalka.ru");
        newUser.setPassword("123321");

        final String actualJSON = target("user").request().put(Entity.json(newUser), String.class),
                     expectedJSON  = "{\"id\":3}";

        assertEquals(expectedJSON, actualJSON);

        org.hibernate.Session testSession = sessionFactory.openSession();
        UserDataSetDAO dao = new UserDataSetDAO(testSession);

        dao.getUser(3);
        assertEquals("admin", newUser.getLogin());
        assertEquals("admin@lalka.ru", newUser.getEmail());
        assertEquals("123321", newUser.getPassword());

        testSession.close();
    }


    @Test
    public void testCreateExistUserFail() throws Exception {
        UserDataSet newUser = new UserDataSet();
        newUser.setLogin("user1");
        newUser.setEmail("user1@mail.ru");
        newUser.setPassword("12345");

        final Response actualResponse = target("user").request().put(Entity.json(newUser));

        assertEquals(FORBIDDEN, actualResponse.getStatus());
    }

    @Test
    public void testEditMyself() throws HibernateException {
        UserDataSet updatedUser = new UserDataSet();
        updatedUser.setLogin("user321");
        updatedUser.setEmail("user321@google.com");
        updatedUser.setPassword("---000---");

        final String actualJson = target("user").path("1").request().post(Entity.json(updatedUser), String.class),
                     expectedJson = "{\"id\":1}";

        assertEquals(expectedJson, actualJson);

        org.hibernate.Session testSession = sessionFactory.openSession();
        UserDataSetDAO dao = new UserDataSetDAO(testSession);

        updatedUser = dao.getUser(1);    // Вот здесь стоп
        assertEquals("user321", updatedUser.getLogin());
        assertEquals("user321@google.com", updatedUser.getEmail());
        assertEquals("---000---", updatedUser.getPassword());

        testSession.close();
    }

    @Test
    public void testEditOtherUserFail() throws Exception {
        UserDataSet updatedUser = new UserDataSet();
        updatedUser.setLogin("user123");
        updatedUser.setEmail("user123@google.com");
        updatedUser.setPassword("000---000");

        final Response actualResponse = target("user").path("2").request().post(Entity.json(updatedUser));

        assertEquals(FORBIDDEN, actualResponse.getStatus());
    }

    @Test
    public void testDeleteMyself() throws Exception {
        final String actualJson = target("user").path("1").request().delete(String.class),
                     expectedJson = ""; // "{}"

        assertEquals(expectedJson, actualJson);

        final Response actualResponse = target("user").path("1").request().get();

        assertEquals(UNAUTHORIZED, actualResponse.getStatus());
    }

    @Test
    public void testDeleteOtherUserFail() throws Exception {
        final Response actualResponse = target("user").path("2").request().delete();

        assertEquals(FORBIDDEN, actualResponse.getStatus());
    }

    @Test
    public void testAuthorized() {
        final String actualJson = target("session").request().get(String.class),
                     expectedJson = "{\"id\":1}";

        assertEquals(expectedJson, actualJson);
    }

    @Test
    public void testLogout() {
        final String actualJson = target("session").request().delete(String.class),
                     expectedJson = "";

        assertEquals(expectedJson, actualJson);

        final Response actualResponse = target("session").request().get();
        assertEquals(UNAUTHORIZED, actualResponse.getStatus());
    }
}