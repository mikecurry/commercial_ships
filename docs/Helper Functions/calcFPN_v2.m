% calculate FPN for all designs: VERSION 2
% done via projections onto 0% pareto set

function [FPN] = calcFPN_v2(Utility,Cost,eps)
% Inputs:
% Utility should be the utility matrix (i,j) for i=design, j=epoch, using
% either single or multi attribute utility
% Cost should be the cost for each design in each epoch, oganized the same
% way.  OPERATING costs should be used if intending to use this function
% with changeability analysis tools.
% eps should be a scalar that states to what accuracy you want the FPN (ie,
% results will be between the exact FPN and that + eps)

% Requirements:
% calls gen_pareto_set.m

numdesigns = size(Utility,1);
numepochs = size(Utility,2);

FPN = -ones(numdesigns,numepochs);

% set all NaN's to 0 utility, max cost for the purposes of calculating fuzzy
% percentages
idx = isnan(Utility);
Utility(idx) = 0;
Cost(idx) = max(max(Cost));

for epoch = 1:numepochs
    %disp(['Calculating Fuzzy Pareto Levels for epoch: ' num2str(epoch)])
    ParetoSet = gen_pareto_set([Utility(:,epoch),Cost(:,epoch)],[1 0],1,false,0);
    
    ParetoCoord = [Cost(ParetoSet,epoch) Utility(ParetoSet,epoch)];
    % sort points by increasing cost
    [val sortidx] = sort(ParetoCoord(:,1),'ascend');
    ParetoCoord = ParetoCoord(sortidx,:);
    
    CostRange = max(Cost(:,epoch)) - min(Cost(:,epoch));
    UtilRange = max(Utility(:,epoch)) - min(Utility(:,epoch));
    
    for d = 1:numdesigns

        if any(ParetoSet==d)
            FPN(d,epoch) = 0;
        else
            currCost = Cost(d,epoch);
            currUtil = Utility(d,epoch);


            utop = [ParetoCoord(1,1) ParetoCoord(end,2)];  % initial upper bound is utopia
            upper = min([(currCost-utop(1))/CostRange (utop(2)-currUtil)/UtilRange]); % minimum fuzziness to get there
            lower = 0;
            currFuzz = .5 * upper;  % initial jump halfway to upper
            while (upper-lower)>(eps/100)  % divide epsilon so that it is the error on FPN and not the fuzziness range
                
                newCost = currCost - currFuzz*CostRange;
                newUtil = currUtil + currFuzz*UtilRange;
                
                % identify Pareto points that dominate
                % all indices from utilIdx to costIdx dominate
                costIdx = find(newCost>=ParetoCoord(:,1),1,'last');
                utilIdx = find(newUtil<=ParetoCoord(:,2),1);
                
                % if costIdx<utilIdx, no points dominate
                if isempty(costIdx) || isempty(utilIdx) || costIdx<utilIdx
                    upper = currFuzz;
                    % set new fuzz to go halfway back to lower bound
                    currFuzz = (upper+lower)/2;
                else
                    lower = currFuzz;
                    % set new fuzz to go halfway to upper bound
                    currFuzz = (upper+lower)/2;
                end
                
            end
            % breaks out when upper and lower converge
            % set fuzziness to upper (tighest bound that was dominant)
            
            FPN(d,epoch) = upper*100;
            
            % if this returns zero, the initial upper was zero, implying
            % that either cost or utility is at utopia but not the other
            % we want to distinguish this from a "true" pareto efficient
            % point with FPN=0, so check and replace if so
            if FPN(d,epoch) == 0
                FPN(d,epoch) = eps/2;
            end

            
        end
    end
end

FPN(idx) = 101;
