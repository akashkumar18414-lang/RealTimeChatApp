package com.team.Spring.DTO;

import com.team.Spring.Enum.CountryEnum;
import com.team.Spring.Enum.JoinPolicyEnum;
import com.team.Spring.Enum.VisibilityEnum;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO used to create a new room. All fields required per your entity
 * constraints.
 */
public class CreateRoomDTO {

	@NotBlank(message = "Room name is required.")
	@Size(max = 120, message = "Room name must be at most {max} characters.")
	private String name;

	@Size(max = 1000, message = "Description must be at most {max} characters.")
	private String description;

	@NotNull(message = "Visibility is required.")
	private VisibilityEnum visibility;

	@NotNull(message = "Join policy is required.")
	private JoinPolicyEnum joinPolicy;

	@NotNull(message = "Preferred country is required.")
	private CountryEnum preferredCountry;

	@NotNull(message = "Max members is required.")
	@Min(value = 2, message = "Max members must be at least {value}.")
	@Max(value = 5000, message = "Max members must be at most {value}.")
	private Integer maxMembers;

	// --- getters / setters ---
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

	public Integer getMaxMembers() {
		return maxMembers;
	}

	public void setMaxMembers(Integer maxMembers) {
		this.maxMembers = maxMembers;
	}
}
