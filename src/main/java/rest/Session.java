package rest;

import db.UserDataSet;
import main.AccountService;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

/**
 * @author iu6team
 */

@Singleton
@Path("/session")
public class Session {
    @Inject
    private main.Context context;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkAuth(@Context HttpServletRequest request) {
        final AccountService accountService = context.get(AccountService.class);
        final String sessionId = request.getSession().getId();
        main.Session session = new main.Session(sessionId);
        if (accountService.checkAuth(session)) {
            UserDataSet userTemp = accountService.giveProfileFromSessionId(sessionId);
            if (accountService.isExists(userTemp)) {
                long temp = accountService.getUserByLogin(userTemp.getLogin()).getId();
                return Response.status(Response.Status.OK).entity(accountService.getIdByJson(temp)).build();
            }
        }
        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @XmlRootElement
    private class RequestBody implements Serializable {
        @XmlElement private String login;
        @XmlElement private String password;
        @XmlElement private boolean remember;

        public String getLogin() {
            return login;
        }

        public String getPassword() {
            return password;
        }

        public boolean isRemember() {
            return remember;
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response loginUser(RequestBody body, @Context HttpHeaders headers, @Context HttpServletRequest request) {
        final AccountService accountService = context.get(AccountService.class);

        UserDataSet user = new UserDataSet();
        user.setLogin(body.getLogin());
        user.setPassword(body.getPassword());

        if (accountService.isExists(user)) {
            if (user.getPassword().equals(accountService.getUserByLogin(user.getLogin()).getPassword())) {
                final String sessionId = request.getSession().getId();
                accountService.addSession(new main.Session(sessionId, !body.isRemember()) , user);
                return Response.status(Response.Status.OK).entity(accountService.getIdByJson(accountService.getUserByLogin(user.getLogin()).getId())).build();
            }
        }
        return Response.status(Response.Status.BAD_REQUEST).build();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response logOut(@Context HttpServletRequest request){
        final AccountService accountService = context.get(AccountService.class);
        final String sessionId = request.getSession().getId();
        accountService.deleteSession(new main.Session(sessionId));
        return Response.status(Response.Status.OK).build();
    }
}
