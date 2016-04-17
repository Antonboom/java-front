package main;

import org.jetbrains.annotations.NotNull;

/**
 * Created by anthony on 16.04.16.
 */
public class Session {
    private String ID;
    private long creationTime;
    private boolean death;

    public Session(@NotNull String ID) {
        this.ID = ID;
    }

    public Session(@NotNull String ID, boolean death) {
        this.ID = ID;
        this.death = death;
        this.creationTime = System.currentTimeMillis();

    }

    public String getID() {
        return ID;
    }

    public boolean isDeath() {
        return death;
    }

    public void setID(String ID) {
        this.ID = ID;
    }

    public void setDeath(boolean death) {
        this.death = death;
    }

    public long getCreationTime() {
        return creationTime;
    }

    @Override
    public boolean equals(Object object) {
        if (object == null) {
            return false;
        }
        if (this.getClass() != object.getClass()) {
            return false;
        }
        Session sessionTemp = (Session) object;
        return this.ID.equals(sessionTemp.ID);
    }

    @Override
    public int hashCode() {
        return this.ID.hashCode();
    }
}
