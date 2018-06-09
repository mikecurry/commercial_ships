close all; clear all;
addpath('./data/')
load spacetug_vasc.mat
load spacetug_transition_matrices.mat

% From Matt Fitzgerald's Masters Thesis
% For Space Tug, eras were constructed according to the following rules:
% 1. Epochs are chosen with a random user (mission type)
% 2. Epochs have a duration selected via a discrete uniform random distribution from 1 to 12
% months
% 3. The technology context variable starts at ?present? and transitions to ?future? at a random
% point after 5 years
% 4. The total era length is 10 years

tfinal = 10*12; % [months] (10 years * 12)
t1 = 1; t2 = 1; % initial sim indeces
num_designs = 384;
mau_out = zeros(num_designs, tfinal);
fpn_out = zeros(num_designs, tfinal);

A = [];
change_execution = zeros(384,384);
for kk = 1:1000
    design_nums = 1:384;
    while t2<tfinal

        % choose duration 1 - 12 months
        %duration = 6; % [months] for now assume fixed at 6
        duration = randi(6,1);

        % Compute start and stop time for this interval
        t1 = t2;
        t2 = t2 + duration - 1;
        if t2>tfinal
            t2 = tfinal;
        end

        % choose random mission 1-8
        % mission = 1; % [1-8] assume mission 1 for now
        mission = randi(8,1);

        % if t > 5 years (60 months), change context to future
        % context = 1; % [1-2] assume context 1 for now
        if t1>(5*12)
            context = 2;
            A_cost = A_cost_future;
        else
            context = 1;
            A_cost = A_cost_present;
        end

        epoch_num = ((context-1)*8)+mission;

        % Check to see if any of the designs ever go invalid and execute the
        % survive strategy if so
        % idx = find(fpn(design_nums,mission,context)>100);
        idx = design_nums;
        if ~isempty(idx)
            for ii = 1:length(idx)
                source_design = design_nums(idx(ii));
                % find available transitions for this design and choose the one
                % with the FPN closest to zero
                candidate_target_designs = find(A_cost(source_design,:)~=0);
                if ~isempty(candidate_target_designs)
                   min_fpn = min(fpn(candidate_target_designs,mission,context));
                    if min_fpn<101
                        % FIXME - what should we do if this returns 2 equally
                        % cheap minimum paths
                        idx2 = find(fpn(candidate_target_designs,mission,context) == min_fpn,1);
                        target_design = candidate_target_designs(idx2);
                        design_nums(source_design) = target_design;
                        change_execution(source_design, target_design) = ...
                        change_execution(source_design, target_design)+1;
                    end
                else
                    disp('No reachable target designs');
                    % for space tug there are no families of single designs so
                    % there will always be targets, but run this check just in case                
                end
            end
        end
        %figure(100); plot(design_nums,'o')
        %pause(0.1)
        idx_now = find(fpn(design_nums,mission,context)>100);
        %disp(sprintf('Were %i invalids, now %i',length(idx),length(idx_now)));

        % Output time histories for each of the 384 starting designs include:
        % MAU, FPN, and what if any change option was executed
        mau_out(1:384,t1:t2) = repmat(mau(design_nums,mission,context),1,t2-t1+1);
        fpn_out(1:384,t1:t2) = repmat(fpn(design_nums,mission,context),1,t2-t1+1);

        %idx = find(fpn(:,mission,context)>100);
        A = [A, [1:384;t1*ones(1,384);fpn(:,mission,context)']];
        if t2==tfinal
            A = [A, [1:384;t2*ones(1,384);fpn(:,mission,context)']];
        end

    end
end
keyboard
%% Era Metrics for FPN
fpn_expedience       = sum(fpn_out(:,1:(tfinal/2))')./sum(fpn_out(:,1:(tfinal))');
fpn_variability      = sum(abs((fpn_out(:,2:end) - fpn_out(:,1:end-1))'));
fpn_average          = sum(fpn_out')/(tfinal);
fpn_max_instant_fall = min((fpn_out(:,2:end) - fpn_out(:,1:end-1))');
fpn_max_instant_rise = max((fpn_out(:,2:end) - fpn_out(:,1:end-1))');
fpn_range            = range(fpn_out');

B = [A;...
    fpn_expedience(A(1,:));...
    fpn_variability(A(1,:));...
    fpn_average(A(1,:));...
    fpn_max_instant_fall(A(1,:));...
    fpn_max_instant_rise(A(1,:));...
    fpn_range(A(1,:))];

for ii = 1:num_designs
    idx = find(fpn_out(ii,:)>100);
    ever_invalid(ii) = 1;
    if ~isempty(idx)
        idx2 = find(A(1,:)==ii);
        A(:,idx2) = [];
        B(:,idx2) = [];
    else
        ever_invalid(ii) = 0;
        plot(fpn_out(ii,:))
        hold on;
    end
end

% A = [fpn_expedience',fpn_variability',fpn_average',fpn_max_instant_fall',fpn_max_instant_rise',fpn_range',ever_invalid'];
% csvwrite('junk.csv',A);