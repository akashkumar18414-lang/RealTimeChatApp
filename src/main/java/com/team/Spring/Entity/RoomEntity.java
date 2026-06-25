package com.team.Spring.Entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import com.team.Spring.Enum.CountryEnum;
import com.team.Spring.Enum.JoinPolicyEnum;
import com.team.Spring.Enum.VisibilityEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "chat_rooms")
public class RoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String name;

    @Size(max = 1000)
    @Column(nullable = true, length = 1000)
    private String description = "No Description";

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VisibilityEnum visibility;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private JoinPolicyEnum joinPolicy;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CountryEnum preferredCountry;

    @Min(2)
    @Column(nullable = false)
    private Integer maxMembers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private UserAuthEntity createdBy;

    // members set — many-to-many relationship
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "room_members",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<UserAuthEntity> members = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RoomEntity() {}

    public RoomEntity(String name, String description, VisibilityEnum visibility, JoinPolicyEnum joinPolicy, CountryEnum preferredCountry, Integer maxMembers, UserAuthEntity createdBy) {
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.joinPolicy = joinPolicy;
        this.preferredCountry = preferredCountry;
        this.maxMembers = maxMembers;
        this.createdBy = createdBy;
    }
    
    // --- helpers ---
    public int getMemberCount() {
        return members == null ? 0 : members.size();
    }

    public boolean isFull() {
        return (maxMembers != null) && (getMemberCount() >= maxMembers);
    }
    
    public void addMember(UserAuthEntity member) {
    	this.members.add(member);
    }
    
    public boolean isMember(UserAuthEntity member) {
    	return this.members.contains(member);
    }
    
    public void removeMember(UserAuthEntity member) {
    	this.members.remove(member);
    }

    // --- Getters & Setters ---
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

	public UserAuthEntity getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(UserAuthEntity createdBy) {
		this.createdBy = createdBy;
	}

	public Set<UserAuthEntity> getMembers() {
		return members;
	}

	public void setMembers(Set<UserAuthEntity> members) {
		this.members = members;
	}

	public String getId() {
		return id;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@Override
	public int hashCode() {
		return Objects.hash(members);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		RoomEntity other = (RoomEntity) obj;
		return Objects.equals(members, other.members);
	}

	
    
}
