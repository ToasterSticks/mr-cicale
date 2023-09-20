import type {
	APIApplicationCommandInteractionDataIntegerOption,
	APIApplicationCommandInteractionDataNumberOption,
	APIApplicationCommandInteractionDataStringOption,
} from 'discord-api-types/v10';

declare global {
	const CLIENT_ID: string;
	const CLIENT_SECRET: string;
	const PUBLIC_KEY: string;
	const BOT_TOKEN: string;
	const DOCUMENT_ID: string;
	const CANVAS_API_DOMAIN: string;
	const CANVAS_API_TOKEN: string;
	const CANVAS_COURSE_ID: string;
	const FORUM_CHANNEL: string;
	const HOMEWORK_FORUM_TAG: string;
	const ALL_ROLE_ID: string;
}

export type APIApplicationCommandInteractionDataAutocompleteOption =
	| APIApplicationCommandInteractionDataStringOption
	| APIApplicationCommandInteractionDataIntegerOption
	| APIApplicationCommandInteractionDataNumberOption;

export interface Module {
	id: number;
	workflow_state: 'active' | 'deleted';
	position: number;
	name: string;
	unlock_at?: Date;
	require_sequential_progress: boolean;
	prerequisite_module_ids: number[];
	items_count: number;
	items_url: string;
	items: ModuleItem[] | null;
	state: 'locked' | 'unlocked' | 'started' | 'completed';
	completed_at: Date | null;
	publish_final_grade: number;
	published: boolean;
}

export interface ModuleItem {
	id: number;
	module_id: number;
	position: number;
	title: string;
	indent: number;
	type:
		| 'File'
		| 'Page'
		| 'Discussion'
		| 'Assignment'
		| 'Quiz'
		| 'SubHeader'
		| 'ExternalUrl'
		| 'ExternalTool';
	content_id: number;
	html_url: string;
	url?: string;
	page_url?: string;
	external_url?: string;
	new_tab?: boolean;
	completion_requirement: CompletionRequirement;
	content_details?: ContentDetails;
	published?: boolean;
}

export interface CompletionRequirement {
	type: string;
	min_score: number;
	completed: boolean;
}

export interface ContentDetails {
	points_possible: number;
	due_at: Date;
	unlock_at: Date;
	lock_at: Date;
	locked_for_user: boolean;
	lock_explanation: string;
	lock_info: LockInfo;
}

export interface LockInfo {
	asset_string: string;
	unlock_at: Date;
	lock_at: Date;
}

export interface CanvasFile {
	id: number;
	uuid: string;
	folder_id: number;
	display_name: string;
	filename: string;
	'content-type': string;
	url: string;
	size: number;
	created_at: Date;
	updated_at: Date;
	unlock_at: Date;
	locked: boolean;
	hidden: boolean;
	lock_at: Date;
	hidden_for_user: boolean;
	visibility_level: 'course' | 'institution' | 'public';
	thumbnail_url: null;
	modified_at: Date;
	mime_class: string;
	media_entry_id: string;
	locked_for_user: boolean;
	lock_info: null;
	lock_explanation: string;
	preview_url?: string;
}

export interface Assignment {
	id: number;
	name: string;
	description: string;
	created_at: Date;
	updated_at: Date;
	due_at: Date;
	lock_at: Date;
	unlock_at: Date;
	has_overrides: boolean;
	all_dates: null;
	course_id: number;
	html_url: string;
	submissions_download_url: string;
	assignment_group_id: number;
	due_date_required: boolean;
	allowed_extensions: string[];
	max_name_length: number;
	turnitin_enabled: boolean;
	vericite_enabled: boolean;
	turnitin_settings: null;
	grade_group_students_individually: boolean;
	external_tool_tag_attributes: null;
	peer_reviews: boolean;
	automatic_peer_reviews: boolean;
	peer_review_count: number;
	peer_reviews_assign_at: Date;
	intra_group_peer_reviews: boolean;
	group_category_id: number;
	position: number;
	post_to_sis: boolean;
	integration_id: string;
	points_possible: number;
	submission_types: string[];
	has_submitted_submissions: boolean;
	grading_type: string;
	grading_standard_id: null;
	published: boolean;
	unpublishable: boolean;
	only_visible_to_overrides: boolean;
	locked_for_user: boolean;
	lock_info: null;
	lock_explanation: string;
	quiz_id: number;
	anonymous_submissions: boolean;
	discussion_topic: null;
	freeze_on_copy: boolean;
	frozen: boolean;
	frozen_attributes: string[];
	submission: null;
	use_rubric_for_grading: boolean;
	rubric_settings: null;
	rubric: null;
	assignment_visibility: number[];
	overrides: null;
	omit_from_final_grade: boolean;
	hide_in_gradebook: boolean;
	moderated_grading: boolean;
	grader_count: number;
	final_grader_id: number;
	grader_comments_visible_to_graders: boolean;
	graders_anonymous_to_graders: boolean;
	grader_names_visible_to_final_grader: boolean;
	anonymous_grading: boolean;
	allowed_attempts: number;
	post_manually: boolean;
	score_statistics: null;
	can_submit: boolean;
	ab_guid: string[];
	annotatable_attachment_id: null;
	anonymize_students: boolean;
	require_lockdown_browser: boolean;
	important_dates: boolean;
	muted: boolean;
	anonymous_peer_reviews: boolean;
	anonymous_instructor_annotations: boolean;
	graded_submissions_exist: boolean;
	is_quiz_assignment: boolean;
	in_closed_grading_period: boolean;
	can_duplicate: boolean;
	original_course_id: number;
	original_assignment_id: number;
	original_lti_resource_link_id: number;
	original_assignment_name: string;
	original_quiz_id: number;
	workflow_state: string;
}
