package rest;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * Created by anthony on 17.04.16.
 */

@XmlRootElement
public class RequestBody {
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
