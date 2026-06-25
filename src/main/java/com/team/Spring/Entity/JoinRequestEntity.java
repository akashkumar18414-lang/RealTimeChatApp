package com.team.Spring.Entity;

import java.time.LocalDateTime;

import com.team.Spring.Enum.JoinRequestStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "join_requests", uniqueConstraints = { @UniqueConstraint(columnNames = { "room_id", "user_id" }) })
public class JoinRequestEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "room_id", nullable = false)
	private RoomEntity room;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAuthEntity user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private JoinRequestStatusEnum status = JoinRequestStatusEnum.PENDING;

	@Column(nullable = false, updatable = false)
	private LocalDateTime requestedAt = LocalDateTime.now();

	@Column
	private LocalDateTime processedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "processed_by")
	private UserAuthEntity processedBy;

	public JoinRequestEntity() {
		super();
	}

	public JoinRequestEntity(RoomEntity room, UserAuthEntity user) {
		super();
		this.room = room;
		this.user = user;
	}

	public RoomEntity getRoom() {
		return room;
	}

	public UserAuthEntity getUser() {
		return user;
	}

	public JoinRequestStatusEnum getStatus() {
		return status;
	}

	public void setStatus(JoinRequestStatusEnum status) {
		this.status = status;
	}

	public LocalDateTime getProcessedAt() {
		return processedAt;
	}

	public void setProcessedAt(LocalDateTime processedAt) {
		this.processedAt = processedAt;
	}

	public UserAuthEntity getProcessedBy() {
		return processedBy;
	}

	public void setProcessedBy(UserAuthEntity processedBy) {
		this.processedBy = processedBy;
	}

	public Long getId() {
		return id;
	}

	public LocalDateTime getRequestedAt() {
		return requestedAt;
	}

	@Override
	public String toString() {
		return "JoinRequestEntity [id=" + id + ", room=" + room + ", user=" + user + ", status=" + status
				+ ", requestedAt=" + requestedAt + ", processedAt=" + processedAt + ", processedBy=" + processedBy
				+ "]";
	}
}
