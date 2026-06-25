package com.team.Spring.DTO;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.team.Spring.Enum.CountryEnum;
import com.team.Spring.Enum.JoinPolicyEnum;
import com.team.Spring.Enum.VisibilityEnum;

/**
 * Compact DTO for listing rooms (public list or lists in the UI). No validation
 * needed — this is a response DTO.
 */
@Component
public class RoomListItemDTO {

	private String id;
	private String name;
	private String description;
	private VisibilityEnum visibility;
	private JoinPolicyEnum joinPolicy;
	private CountryEnum preferredCountry;
	private Long memberCount;
	private Integer maxMembers;
	private String updatedAt; // ISO string for quick client display

	public RoomListItemDTO() {
		super();
	}

	public RoomListItemDTO(String id, String name, String description, VisibilityEnum visibility,
			JoinPolicyEnum joinPolicy, CountryEnum preferredCountry, Long memberCount, Integer maxMembers,
			LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.visibility = visibility;
		this.joinPolicy = joinPolicy;
		this.preferredCountry = preferredCountry;
		this.memberCount = memberCount;
		this.maxMembers = maxMembers;
		this.updatedAt = updatedAt.toString();
	}

	// --- getters / setters ---
	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public VisibilityEnum getVisibility() {
		return visibility;
	}

	public void setVisibility(VisibilityEnum visibility) {
		this.visibility = visibility;
	}

	public JoinPolicyEnum getJoinPolicy() {
		return joinPolicy;
	}

	public void setJoinPolicy(JoinPolicyEnum joinPolicy) {
		this.joinPolicy = joinPolicy;
	}

	public CountryEnum getPreferredCountry() {
		return preferredCountry;
	}

	public void setPreferredCountry(CountryEnum preferredCountry) {
		this.preferredCountry = preferredCountry;
	}

	public Long getMemberCount() {
		return memberCount;
	}

	public void setMemberCount(Long memberCount) {
		this.memberCount = memberCount;
	}

	public Integer getMaxMembers() {
		return maxMembers;
	}

	public void setMaxMembers(Integer maxMembers) {
		this.maxMembers = maxMembers;
	}

	public String getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(String updatedAt) {
		this.updatedAt = updatedAt;
	}
	
	public boolean isFull() {
        return (maxMembers != null) && (getMemberCount() >= maxMembers);
    }
}
