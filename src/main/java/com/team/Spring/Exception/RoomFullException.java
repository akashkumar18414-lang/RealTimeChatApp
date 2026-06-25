package com.team.Spring.Exception;

public class RoomFullException extends RuntimeException {

	private static final long serialVersionUID = 2303186012794681504L;

	public RoomFullException(String message) {
		super(message);
	}
	
}
