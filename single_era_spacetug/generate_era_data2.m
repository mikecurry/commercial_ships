addpath('./data/')
load spacetug_vasc.mat

% From Matt Fitzgerald's Masters Thesis
% For Space Tug, eras were constructed according to the following rules:
% 1. Epochs are chosen with a random user (mission type)
% 2. Epochs have a duration selected via a discrete uniform random distribution from 1 to 12
% months
% 3. The technology context variable starts at ?present? and transitions to ?future? at a random
% point after 5 years
% 4. The total era length is 10 years

epoch_num = 1;
epoch_transition = zeros(16,16);
for jj = 1:100
    tfinal = 10*12; % [months] (10 years * 12)
    t1 = 1; t2 = 1; % initial sim indeces
    num_designs = 384;
    mau_out = zeros(num_designs, tfinal);
    fpn_out = zeros(num_designs, tfinal);

    A = [];
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
        else
            context = 1;
        end

        epoch_num_prev = epoch_num;
        epoch_num = ((context-1)*8)+mission;
        epoch_transition(epoch_num_prev,epoch_num)=epoch_transition(epoch_num_prev,epoch_num)+1;
        % Output time histories for each of the 384 starting designs include:
        % MAU, FPN, and what if any change option was executed
        mau_out(:,t1:t2) = repmat(mau(:,mission,context),1,t2-t1+1);
        fpn_out(:,t1:t2) = repmat(fpn(:,mission,context),1,t2-t1+1);

        %idx = find(fpn(:,mission,context)>100);
        A = [A, [1:384;t1*ones(1,384);fpn(:,mission,context)']];
        if t2==tfinal
            A = [A, [1:384;t2*ones(1,384);fpn(:,mission,context)']];
        end

    end

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
            %plot(fpn_out(ii,:))
            %hold on;
        end
    end
end
% A = [fpn_expedience',fpn_variability',fpn_average',fpn_max_instant_fall',fpn_max_instant_rise',fpn_range',ever_invalid'];
% csvwrite('junk.csv',A);